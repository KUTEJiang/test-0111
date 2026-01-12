import { openai } from './openai'
import { CONTENT_OPTIMIZATION_PROMPT, STORY_TITLE_PROMPT } from './prompts'

interface OptimizeContentResult {
  optimized: string
  changes: string[]
  tone: 'casual' | 'poetic' | 'narrative'
}

interface GenerateTitleResult {
  title: string
  subtitle: string
}

/**
 * 优化文案内容
 */
export async function optimizeContent(
  content: string,
  options: {
    maxRetries?: number
  } = {}
): Promise<OptimizeContentResult> {
  const { maxRetries = 3 } = options

  // 如果内容太短，不需要优化
  if (content.length < 20) {
    return {
      optimized: content,
      changes: [],
      tone: 'casual',
    }
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const prompt = CONTENT_OPTIMIZATION_PROMPT.replace('{content}', content)

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅行故事编辑，擅长在保持原作者风格的同时提升文章可读性。请用JSON格式回复。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('Empty response from OpenAI')
      }

      const result = JSON.parse(responseContent) as OptimizeContentResult

      // 验证结果
      if (!result.optimized || typeof result.optimized !== 'string') {
        throw new Error('Invalid optimization result')
      }

      return result
    } catch (error) {
      console.error(`Content optimization attempt ${attempt + 1} failed:`, error)

      if (attempt === maxRetries - 1) {
        // 返回原文
        return {
          optimized: content,
          changes: [],
          tone: 'casual',
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  return {
    optimized: content,
    changes: [],
    tone: 'casual',
  }
}

/**
 * 批量优化多段内容
 */
export async function optimizeContents(
  contents: Array<{ id: string; content: string }>
): Promise<Map<string, OptimizeContentResult>> {
  const results = new Map<string, OptimizeContentResult>()

  // 串行处理以避免rate limit
  for (const item of contents) {
    const result = await optimizeContent(item.content)
    results.set(item.id, result)
    
    // 添加延迟以避免rate limit
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * 生成故事标题和副标题
 */
export async function generateStoryTitle(
  summary: string,
  location: string,
  dateRange: string
): Promise<GenerateTitleResult> {
  try {
    const prompt = STORY_TITLE_PROMPT
      .replace('{summary}', summary)
      .replace('{location}', location)
      .replace('{dateRange}', dateRange)

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '你是一位创意文案专家，擅长为旅行故事起标题。请用JSON格式回复。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response')
    }

    const result = JSON.parse(content) as GenerateTitleResult
    return result
  } catch (error) {
    console.error('Generate title error:', error)
    
    // 返回默认标题
    return {
      title: `${location || '我的'}旅行故事`,
      subtitle: dateRange ? `${dateRange}的回忆` : '一段难忘的旅程',
    }
  }
}
