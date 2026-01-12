'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button, LoadingOverlay } from '@/components/ui'
import type { Memo, TemplateType, Story } from '@/types'

type Step = 'template' | 'processing' | 'preview'

const TEMPLATES: Array<{
  id: TemplateType
  name: string
  description: string
  preview: string
}> = [
  {
    id: 'MAGAZINE',
    name: '杂志风',
    description: '大图配文字，适合风景为主的旅行',
    preview: '/templates/magazine-preview.svg',
  },
  {
    id: 'CARD',
    name: '卡片风',
    description: '简洁卡片布局，适合手机浏览',
    preview: '/templates/card-preview.svg',
  },
  {
    id: 'TIMELINE',
    name: '时间轴',
    description: '按时间顺序展示，适合多日行程',
    preview: '/templates/timeline-preview.svg',
  },
]

export default function CreateStoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const memoIds = searchParams.getAll('memoIds')

  const [step, setStep] = React.useState<Step>('template')
  const [selectedTemplate, setSelectedTemplate] = React.useState<TemplateType>('CARD')
  const [processing, setProcessing] = React.useState(false)
  const [processingMessage, setProcessingMessage] = React.useState('')
  const [story, setStory] = React.useState<Story | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleGenerate = async () => {
    if (memoIds.length === 0) {
      alert('请先选择日记')
      router.push('/')
      return
    }

    setStep('processing')
    setProcessing(true)
    setError(null)

    const messages = [
      '正在分析图片...',
      '选择最佳照片...',
      '优化文案内容...',
      '生成故事布局...',
      '即将完成...',
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length
      setProcessingMessage(messages[messageIndex])
    }, 2000)

    try {
      setProcessingMessage(messages[0])

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoIds,
          template: selectedTemplate,
          photoCount: 12,
          optimizeContent: true,
        }),
      })

      clearInterval(messageInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '生成失败')
      }

      const { story: generatedStory } = await response.json()
      setStory(generatedStory)
      setStep('preview')
    } catch (err) {
      clearInterval(messageInterval)
      setError(err instanceof Error ? err.message : '生成故事时发生错误')
      setStep('template')
    } finally {
      setProcessing(false)
    }
  }

  const handlePublish = async () => {
    if (!story) return

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: true }),
      })

      if (!response.ok) {
        throw new Error('发布失败')
      }

      // 跳转到分享页
      router.push(`/stories/${story.shareId}`)
    } catch (err) {
      alert('发布失败，请重试')
    }
  }

  if (step === 'processing') {
    return (
      <LoadingOverlay message={processingMessage} />
    )
  }

  if (step === 'preview' && story) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setStep('template')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回选择模板
            </button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                保存草稿
              </Button>
              <Button onClick={handlePublish}>
                发布并分享
              </Button>
            </div>
          </div>
        </header>

        {/* Preview */}
        <div className="py-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8 text-center border-b border-slate-200">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{story.title}</h1>
              {story.subtitle && (
                <p className="text-slate-600">{story.subtitle}</p>
              )}
            </div>
            <div className="p-8">
              <p className="text-center text-slate-500">
                故事预览已生成。点击"发布并分享"查看完整效果。
              </p>
              <div className="mt-6 grid grid-cols-4 gap-4">
                {story.selectedPhotos.slice(0, 8).map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={photo.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-lg font-semibold">创建旅行故事</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Template Selection */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            选择故事风格
          </h2>
          <p className="text-slate-600">
            已选择 {memoIds.length} 条日记，选择一个你喜欢的展示风格
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`
                p-6 rounded-xl border-2 transition-all text-left
                ${selectedTemplate === template.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }
              `}
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-4xl">
                  {template.id === 'MAGAZINE' ? '📰' : template.id === 'CARD' ? '🎴' : '📅'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-slate-600">
                {template.description}
              </p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={handleGenerate}>
            开始生成
          </Button>
        </div>
      </main>
    </div>
  )
}
