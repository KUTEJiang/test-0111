import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeImages, selectBestImages } from '@/lib/ai'
import { addDays } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrls } = body

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: '请提供要分析的图片' },
        { status: 400 }
      )
    }

    // 检查缓存
    const existingAnalyses = await prisma.imageAnalysis.findMany({
      where: {
        imageUrl: { in: imageUrls },
        expiresAt: { gt: new Date() },
      },
    })

    const cachedResults = new Map(
      existingAnalyses.map(a => [a.imageUrl, a.aiAnalysis as any])
    )

    // 找出需要分析的图片
    const urlsToAnalyze = imageUrls.filter(url => !cachedResults.has(url))

    // 分析新图片
    let newResults = new Map()
    if (urlsToAnalyze.length > 0) {
      newResults = await analyzeImages(urlsToAnalyze, { concurrency: 3 })

      // 保存到缓存
      const cacheExpiry = addDays(new Date(), 30) // 缓存30天
      
      for (const [url, analysis] of newResults) {
        await prisma.imageAnalysis.upsert({
          where: { imageUrl: url },
          update: {
            aiAnalysis: analysis,
            analyzedAt: new Date(),
            expiresAt: cacheExpiry,
          },
          create: {
            imageUrl: url,
            aiAnalysis: analysis,
            expiresAt: cacheExpiry,
          },
        })
      }
    }

    // 合并结果
    const allResults = new Map([...cachedResults, ...newResults])

    // 选择最佳图片
    const bestImages = selectBestImages(allResults, Math.min(12, imageUrls.length), {
      diversityWeight: 0.2,
    })

    return NextResponse.json({
      analyses: Object.fromEntries(allResults),
      selected: bestImages,
    })
  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { error: '图片分析失败' },
      { status: 500 }
    )
  }
}
