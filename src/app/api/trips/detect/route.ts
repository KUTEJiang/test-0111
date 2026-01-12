import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { detectTrips } from '@/lib/trip-detector'
import type { Memo } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memoIds } = body

    // 获取指定的memos，如果没有指定则获取所有未分配行程的memos
    let memos: Memo[]
    
    if (memoIds && memoIds.length > 0) {
      const dbMemos = await prisma.memo.findMany({
        where: { id: { in: memoIds } },
        orderBy: { date: 'asc' },
      })
      memos = dbMemos.map(m => ({
        ...m,
        images: m.images as any,
        date: m.date,
      }))
    } else {
      const dbMemos = await prisma.memo.findMany({
        where: { tripId: null },
        orderBy: { date: 'asc' },
      })
      memos = dbMemos.map(m => ({
        ...m,
        images: m.images as any,
        date: m.date,
      }))
    }

    // 执行行程检测
    const result = detectTrips(memos)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Trip detection error:', error)
    return NextResponse.json(
      { error: '行程识别失败' },
      { status: 500 }
    )
  }
}
