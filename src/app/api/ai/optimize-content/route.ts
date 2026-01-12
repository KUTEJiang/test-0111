import { NextRequest, NextResponse } from 'next/server'
import { optimizeContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, style } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '请提供要优化的内容' },
        { status: 400 }
      )
    }

    const result = await optimizeContent(content)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content optimization error:', error)
    return NextResponse.json(
      { error: '内容优化失败' },
      { status: 500 }
    )
  }
}
