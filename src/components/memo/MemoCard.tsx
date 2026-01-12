'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Memo } from '@/types'

interface MemoCardProps {
  memo: Memo
  selected?: boolean
  selectable?: boolean
  onSelect?: (memo: Memo) => void
}

export function MemoCard({ memo, selected, selectable, onSelect }: MemoCardProps) {
  const images = memo.images || []
  const coverImage = images[0]?.url

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(memo)
    }
  }

  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md',
        selectable && 'cursor-pointer',
        selected && 'ring-2 ring-primary-500'
      )}
      onClick={handleClick}
    >
      {/* Cover image */}
      {coverImage ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={coverImage}
            alt={memo.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              +{images.length - 1}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
          <svg
            className="h-12 w-12 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Selection indicator */}
      {selectable && (
        <div
          className={cn(
            'absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
            selected
              ? 'border-primary-500 bg-primary-500 text-white'
              : 'border-white bg-white/80'
          )}
        >
          {selected && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-slate-900 line-clamp-1">{memo.title}</h3>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{memo.content}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {formatDate(memo.date, 'long')}
          </span>
          {memo.location && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {memo.location}
            </span>
          )}
        </div>

        {/* Tags */}
        {memo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {memo.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                #{tag}
              </span>
            ))}
            {memo.tags.length > 3 && (
              <span className="text-xs text-slate-400">+{memo.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (selectable) {
    return content
  }

  return (
    <Link href={`/memos/${memo.id}`}>
      {content}
    </Link>
  )
}
