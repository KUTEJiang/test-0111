'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, TagInput, ImageUploader } from '@/components/ui'
import type { Memo, CreateMemoInput, UpdateMemoInput, MemoImage } from '@/types'

interface MemoEditorProps {
  memo?: Memo
  onSave?: (memo: Memo) => void
}

export function MemoEditor({ memo, onSave }: MemoEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState(memo?.title || '')
  const [content, setContent] = React.useState(memo?.content || '')
  const [tags, setTags] = React.useState<string[]>(memo?.tags || [])
  const [images, setImages] = React.useState<string[]>(
    memo?.images?.map(img => img.url) || []
  )
  const [date, setDate] = React.useState(
    memo?.date
      ? new Date(memo.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [location, setLocation] = React.useState(memo?.location || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('请输入标题')
      return
    }

    setLoading(true)

    try {
      const memoImages: MemoImage[] = images.map(url => ({ url }))
      
      const body = {
        title: title.trim(),
        content: content.trim(),
        tags,
        images: memoImages,
        date,
        location: location.trim() || undefined,
      }

      const url = memo ? `/api/memos/${memo.id}` : '/api/memos'
      const method = memo ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '保存失败')
      }

      const { memo: savedMemo } = await response.json()
      
      if (onSave) {
        onSave(savedMemo)
      } else {
        router.push(`/memos/${savedMemo.id}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert(error instanceof Error ? error.message : '保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          标题 <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这篇日记起个标题"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            日期
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            地点
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="如：东京、京都"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          内容
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录你的旅行故事..."
          className="min-h-[200px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          标签
        </label>
        <TagInput
          value={tags}
          onChange={setTags}
          placeholder="添加标签，如 #japan #tokyo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          照片
        </label>
        <ImageUploader
          value={images}
          onChange={setImages}
          maxFiles={20}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button type="submit" loading={loading}>
          {memo ? '保存修改' : '创建日记'}
        </Button>
      </div>
    </form>
  )
}
