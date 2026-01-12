import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeImages, selectBestImages, optimizeContent, generateStoryTitle } from '@/lib/ai'
import { generateShareId } from '@/lib/utils'
import { format } from 'date-fns'
import { z } from 'zod'
import type { MemoImage, SelectedPhoto, StorySection, OptimizedContent } from '@/types'

const generateStorySchema = z.object({
  memoIds: z.array(z.string()).min(1, '至少选择一个日记'),
  template: z.enum(['MAGAZINE', 'CARD', 'TIMELINE']),
  photoCount: z.number().min(1).max(30).default(12),
  optimizeContent: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = generateStorySchema.parse(body)

    // 获取选中的memos
    const memos = await prisma.memo.findMany({
      where: { id: { in: data.memoIds } },
      orderBy: { date: 'asc' },
    })

    if (memos.length === 0) {
      return NextResponse.json(
        { error: '未找到日记' },
        { status: 404 }
      )
    }

    // 收集所有图片
    const allImages: Array<{ memoId: string; url: string }> = []
    for (const memo of memos) {
      const images = memo.images as MemoImage[]
      for (const img of images) {
        allImages.push({ memoId: memo.id, url: img.url })
      }
    }

    // AI分析和选择图片
    let selectedPhotos: SelectedPhoto[] = []
    
    if (allImages.length > 0) {
      const imageUrls = allImages.map(img => img.url)
      const analyses = await analyzeImages(imageUrls, { concurrency: 3 })
      
      const selected = selectBestImages(analyses, data.photoCount, {
        diversityWeight: 0.2,
      })

      selectedPhotos = selected.map(item => {
        const imageInfo = allImages.find(img => img.url === item.url)
        return {
          memoId: imageInfo?.memoId || '',
          imageUrl: item.url,
          score: item.score,
          reason: item.analysis.description,
          analysis: item.analysis,
        }
      })
    }

    // 处理内容
    const sections: StorySection[] = []
    
    for (const memo of memos) {
      let content = memo.content
      
      // 可选：AI优化内容
      if (data.optimizeContent && memo.content.length > 20) {
        try {
          const optimized = await optimizeContent(memo.content)
          content = optimized.optimized
        } catch (error) {
          console.error('Content optimization failed for memo:', memo.id)
          // 使用原始内容
        }
      }

      const memoImages = (memo.images as MemoImage[]).map(img => img)
      
      sections.push({
        id: memo.id,
        title: memo.title,
        content,
        originalContent: memo.content,
        images: memoImages,
        date: memo.date,
      })
    }

    // 生成标题
    const summary = memos.map(m => m.title).join(', ')
    const locations = [...new Set(memos.map(m => m.location).filter(Boolean))]
    const location = locations.join(' / ') || ''
    const startDate = memos[0].date
    const endDate = memos[memos.length - 1].date
    const dateRange = startDate === endDate
      ? format(startDate, 'yyyy年M月d日')
      : `${format(startDate, 'yyyy年M月d日')} - ${format(endDate, 'M月d日')}`

    let title: string
    let subtitle: string | undefined

    try {
      const generated = await generateStoryTitle(summary, location, dateRange)
      title = generated.title
      subtitle = generated.subtitle
    } catch (error) {
      title = location ? `${location}之旅` : '我的旅行故事'
      subtitle = dateRange
    }

    // 提取主色调用于样式
    const primaryColor = selectedPhotos[0]?.analysis?.mainColors?.[0] || '#7c3aed'

    const optimizedContent: OptimizedContent = {
      title,
      subtitle,
      sections,
    }

    // 创建故事
    const story = await prisma.story.create({
      data: {
        title,
        subtitle,
        template: data.template,
        selectedPhotos: selectedPhotos,
        optimizedContent: optimizedContent,
        styleConfig: {
          primaryColor,
        },
        shareId: generateShareId(8),
        isPublic: false,
        storyMemos: {
          create: data.memoIds.map((memoId, index) => ({
            memoId,
            order: index,
          })),
        },
      },
    })

    return NextResponse.json({ story }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据格式错误', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Generate story error:', error)
    return NextResponse.json(
      { error: '生成故事失败' },
      { status: 500 }
    )
  }
}
