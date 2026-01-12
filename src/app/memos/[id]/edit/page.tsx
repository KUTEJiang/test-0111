'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MemoEditor } from '@/components/memo'
import type { Memo } from '@/types'

interface EditMemoPageProps {
  params: { id: string }
}

export default function EditMemoPage({ params }: EditMemoPageProps) {
  const router = useRouter()
  const [memo, setMemo] = React.useState<Memo | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchMemo()
  }, [params.id])

  const fetchMemo = async () => {
    try {
      const response = await fetch(`/api/memos/${params.id}`)
      if (!response.ok) {
        router.push('/')
        return
      }
      const { memo } = await response.json()
      setMemo(memo)
    } catch (error) {
      console.error('Fetch memo error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!memo) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">编辑日记</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <MemoEditor memo={memo} />
        </div>
      </main>
    </div>
  )
}
