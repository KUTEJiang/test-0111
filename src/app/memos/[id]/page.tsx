'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button, Modal } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import type { Memo, MemoImage } from '@/types'

interface MemoDetailPageProps {
  params: { id: string }
}

export default function MemoDetailPage({ params }: MemoDetailPageProps) {
  const router = useRouter()
  const [memo, setMemo] = React.useState<Memo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    fetchMemo()
  }, [params.id])

  const fetchMemo = async () => {
    try {
      const response = await fetch(`/api/memos/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch')
      }
      const { memo } = await response.json()
      setMemo(memo)
    } catch (error) {
      console.error('Fetch memo error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!memo) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/memos/${memo.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Delete failed')
      }
      
      router.push('/')
    } catch (error) {
      alert('删除失败')
    } finally {
      setDeleting(false)
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

  const images = memo.images as MemoImage[]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/memos/${memo.id}/edit`}>
              <Button variant="outline" size="sm">编辑</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-red-600 hover:bg-red-50"
            >
              删除
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Images */}
          {images.length > 0 && (
            <div className={`grid gap-1 ${images.length === 1 ? '' : 'grid-cols-2'}`}>
              {images.slice(0, 4).map((img, index) => (
                <div
                  key={img.url}
                  className={`relative ${
                    images.length === 1
                      ? 'aspect-[16/9]'
                      : images.length === 3 && index === 0
                      ? 'col-span-2 aspect-[16/9]'
                      : 'aspect-square'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  {index === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-medium">
                        +{images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {memo.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span>{formatDate(memo.date, 'long')}</span>
              {memo.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {memo.location}
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {memo.content}
              </p>
            </div>

            {/* Tags */}
            {memo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
                {memo.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
      >
        <p className="text-slate-600 mb-6">
          确定要删除这篇日记吗？此操作无法撤销。
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  )
}
