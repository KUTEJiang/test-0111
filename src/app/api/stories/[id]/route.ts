import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await prisma.story.findUnique({
      where: { id: params.id },
      include: {
        storyMemos: {
          include: {
            memo: true,
          },
          orderBy: { order: 'asc' },
        },
        trip: true,
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: '故事不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Get story error:', error)
    return NextResponse.json(
      { error: '获取故事失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const story = await prisma.story.update({
      where: { id: params.id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        template: body.template,
        selectedPhotos: body.selectedPhotos,
        optimizedContent: body.optimizedContent,
        styleConfig: body.styleConfig,
        isPublic: body.isPublic,
        publishedAt: body.isPublic ? new Date() : null,
      },
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Update story error:', error)
    return NextResponse.json(
      { error: '更新故事失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.story.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete story error:', error)
    return NextResponse.json(
      { error: '删除故事失败' },
      { status: 500 }
    )
  }
}
