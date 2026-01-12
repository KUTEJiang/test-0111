'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { MemoGrid } from '@/components/memo'
import type { Memo } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [memos, setMemos] = React.useState<Memo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectMode, setSelectMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    fetchMemos()
  }, [])

  const fetchMemos = async () => {
    try {
      const response = await fetch('/api/memos?limit=50')
      const data = await response.json()
      setMemos(data.memos || [])
    } catch (error) {
      console.error('Fetch memos error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStory = () => {
    if (selectedIds.length < 1) {
      alert('请至少选择1条日记')
      return
    }
    // 跳转到故事创建页面，传递选中的memo IDs
    const params = new URLSearchParams()
    selectedIds.forEach(id => params.append('memoIds', id))
    router.push(`/stories/create?${params.toString()}`)
  }

  const toggleSelectMode = () => {
    setSelectMode(!selectMode)
    setSelectedIds([])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span className="text-xl font-bold text-slate-900">旅行故事</span>
          </Link>

          <div className="flex items-center gap-3">
            {selectMode ? (
              <>
                <span className="text-sm text-slate-600">
                  已选择 {selectedIds.length} 条
                </span>
                <Button variant="outline" size="sm" onClick={toggleSelectMode}>
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateStory}
                  disabled={selectedIds.length < 1}
                >
                  生成故事
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={toggleSelectMode}>
                  选择日记
                </Button>
                <Link href="/memos/new">
                  <Button size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    写日记
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Intro section */}
        {!loading && memos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              开始记录你的旅行
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              写下每一天的故事，上传精彩的照片，然后一键生成精美的旅行故事分享页
            </p>
            <Link href="/memos/new">
              <Button size="lg">
                写第一篇日记
              </Button>
            </Link>
          </div>
        )}

        {/* Memo grid */}
        {(loading || memos.length > 0) && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                我的日记
              </h2>
              {selectMode && (
                <p className="text-sm text-slate-500">
                  点击卡片选择要合成故事的日记
                </p>
              )}
            </div>
            <MemoGrid
              memos={memos}
              loading={loading}
              selectable={selectMode}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              emptyMessage="暂无日记，快去写一篇吧"
            />
          </>
        )}
      </main>

      {/* Floating action button for generating story */}
      {selectMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            size="lg"
            onClick={handleGenerateStory}
            className="shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            用 {selectedIds.length} 条日记生成故事
          </Button>
        </div>
      )}
    </div>
  )
}
