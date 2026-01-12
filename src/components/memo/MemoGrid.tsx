'use client'

import * as React from 'react'
import { MemoCard } from './MemoCard'
import { LoadingSpinner } from '@/components/ui'
import type { Memo } from '@/types'

interface MemoGridProps {
  memos: Memo[]
  loading?: boolean
  selectable?: boolean
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  emptyMessage?: string
}

export function MemoGrid({
  memos,
  loading,
  selectable,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = '暂无日记',
}: MemoGridProps) {
  const handleSelect = (memo: Memo) => {
    if (!onSelectionChange) return
    
    const isSelected = selectedIds.includes(memo.id)
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== memo.id))
    } else {
      onSelectionChange([...selectedIds, memo.id])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <svg
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-4">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {memos.map(memo => (
        <MemoCard
          key={memo.id}
          memo={memo}
          selectable={selectable}
          selected={selectedIds.includes(memo.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
