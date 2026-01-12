import { openai } from './openai'
import { IMAGE_ANALYSIS_PROMPT } from './prompts'
import type { ImageAnalysisResult } from '@/types'

interface AnalyzeImageOptions {
  maxRetries?: number
  retryDelay?: number
}

/**
 * 使用GPT-4 Vision分析单张图片
 */
export async function analyzeImage(
  imageUrl: string,
  options: AnalyzeImageOptions = {}
): Promise<ImageAnalysisResult> {
  const { maxRetries = 3, retryDelay = 1000 } = options

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low', // 使用低分辨率以节省token
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('Empty response from OpenAI')
      }

      const result = JSON.parse(content) as ImageAnalysisResult
      
      // 验证结果
      if (typeof result.clarity !== 'number' ||
          typeof result.composition !== 'number' ||
          typeof result.appeal !== 'number') {
        throw new Error('Invalid analysis result format')
      }

      return result
    } catch (error) {
      console.error(`Image analysis attempt ${attempt + 1} failed:`, error)
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      } else {
        // 返回默认值
        return getDefaultAnalysis()
      }
    }
  }

  return getDefaultAnalysis()
}

/**
 * 批量分析图片
 */
export async function analyzeImages(
  imageUrls: string[],
  options: { concurrency?: number } = {}
): Promise<Map<string, ImageAnalysisResult>> {
  const { concurrency = 3 } = options
  const results = new Map<string, ImageAnalysisResult>()

  // 分批处理以控制并发
  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const analysis = await analyzeImage(url)
        return { url, analysis }
      })
    )

    batchResults.forEach(({ url, analysis }) => {
      results.set(url, analysis)
    })
  }

  return results
}

/**
 * 计算图片综合评分
 */
export function calculateImageScore(analysis: ImageAnalysisResult): number {
  // 综合评分 = 清晰度30% + 构图30% + 吸引力40%
  return (analysis.clarity * 0.3 + analysis.composition * 0.3 + analysis.appeal * 0.4) / 10
}

/**
 * 从图片列表中选择最佳图片
 */
export function selectBestImages(
  analyses: Map<string, ImageAnalysisResult>,
  count: number,
  options: {
    diversityWeight?: number // 多样性权重
    subjectDistribution?: Record<string, number> // 期望的主体分布
  } = {}
): Array<{ url: string; analysis: ImageAnalysisResult; score: number }> {
  const { diversityWeight = 0.2 } = options

  // 计算每张图片的基础分数
  const scored = Array.from(analyses.entries()).map(([url, analysis]) => ({
    url,
    analysis,
    score: calculateImageScore(analysis),
  }))

  // 按分数排序
  scored.sort((a, b) => b.score - a.score)

  // 如果不需要考虑多样性，直接返回前N张
  if (diversityWeight === 0 || scored.length <= count) {
    return scored.slice(0, count)
  }

  // 贪心选择，考虑多样性
  const selected: typeof scored = []
  const subjectCounts: Record<string, number> = {}

  for (const item of scored) {
    if (selected.length >= count) break

    // 计算多样性惩罚
    const subject = item.analysis.subject
    const currentCount = subjectCounts[subject] || 0
    const diversityPenalty = currentCount * diversityWeight

    // 调整后的分数
    const adjustedScore = item.score - diversityPenalty

    // 如果调整后分数仍然较高，或者是最后需要填充的
    if (adjustedScore > 0.4 || selected.length < count - (scored.length - scored.indexOf(item))) {
      selected.push({ ...item, score: adjustedScore })
      subjectCounts[subject] = currentCount + 1
    }
  }

  return selected
}

/**
 * 默认分析结果（用于API失败时）
 */
function getDefaultAnalysis(): ImageAnalysisResult {
  return {
    clarity: 5,
    composition: 5,
    appeal: 5,
    subject: 'other',
    mainColors: ['#888888'],
    description: '无法分析此图片',
  }
}
