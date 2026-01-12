import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { format } = body

    if (!['pdf', 'png', 'jpg'].includes(format)) {
      return NextResponse.json(
        { error: '不支持的导出格式' },
        { status: 400 }
      )
    }

    // 获取故事
    const story = await prisma.story.findUnique({
      where: { id: params.id },
    })

    if (!story) {
      return NextResponse.json(
        { error: '故事不存在' },
        { status: 404 }
      )
    }

    // PDF导出需要服务端渲染
    // 这里提供一个简化的实现，实际生产环境可能需要使用 Puppeteer 或专门的 PDF 生成服务
    if (format === 'pdf') {
      // 返回分享页URL，让前端处理打印
      const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/stories/${story.shareId}?print=true`
      
      return NextResponse.json({
        message: '请使用浏览器打印功能导出PDF',
        printUrl: shareUrl,
        // 或者如果有 Puppeteer 服务，可以生成真正的 PDF
        // downloadUrl: 'https://...'
      })
    }

    // 图片导出在客户端处理（使用 html2canvas）
    return NextResponse.json({
      message: '图片导出请在客户端完成',
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: '导出失败' },
      { status: 500 }
    )
  }
}
