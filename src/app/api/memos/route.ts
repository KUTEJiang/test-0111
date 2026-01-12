import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createMemoSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string(),
  images: z.array(z.object({
    url: z.string().url(),
    width: z.number().optional(),
    height: z.number().optional(),
    metadata: z.object({
      takenAt: z.string().optional(),
      location: z.string().optional(),
      camera: z.string().optional(),
    }).optional(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  date: z.string().transform(s => new Date(s)),
  location: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tag = searchParams.get('tag')
    const tripId = searchParams.get('tripId')
    const search = searchParams.get('search')

    const where: any = {}

    if (tag) {
      where.tags = { has: tag }
    }

    if (tripId) {
      where.tripId = tripId === 'none' ? null : tripId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [memos, total] = await Promise.all([
      prisma.memo.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          trip: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.memo.count({ where }),
    ])

    return NextResponse.json({
      memos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get memos error:', error)
    return NextResponse.json(
      { error: '获取日记列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createMemoSchema.parse(body)

    const memo = await prisma.memo.create({
      data: {
        title: data.title,
        content: data.content,
        images: data.images,
        tags: data.tags,
        date: data.date,
        location: data.location,
      },
    })

    return NextResponse.json({ memo }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据格式错误', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create memo error:', error)
    return NextResponse.json(
      { error: '创建日记失败' },
      { status: 500 }
    )
  }
}
