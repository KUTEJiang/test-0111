import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateMemoSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    width: z.number().optional(),
    height: z.number().optional(),
    metadata: z.object({
      takenAt: z.string().optional(),
      location: z.string().optional(),
      camera: z.string().optional(),
    }).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  date: z.string().transform(s => new Date(s)).optional(),
  location: z.string().nullable().optional(),
  tripId: z.string().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memo = await prisma.memo.findUnique({
      where: { id: params.id },
      include: {
        trip: {
          select: { id: true, name: true, startDate: true, endDate: true },
        },
      },
    })

    if (!memo) {
      return NextResponse.json(
        { error: '日记不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ memo })
  } catch (error) {
    console.error('Get memo error:', error)
    return NextResponse.json(
      { error: '获取日记失败' },
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
    const data = updateMemoSchema.parse(body)

    const memo = await prisma.memo.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ memo })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据格式错误', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update memo error:', error)
    return NextResponse.json(
      { error: '更新日记失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.memo.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete memo error:', error)
    return NextResponse.json(
      { error: '删除日记失败' },
      { status: 500 }
    )
  }
}
