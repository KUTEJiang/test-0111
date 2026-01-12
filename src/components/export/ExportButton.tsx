'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface ExportButtonProps {
  storyId: string
  shareId: string
}

export function ExportButton({ storyId, shareId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'pdf' | 'image' | null>(null)

  const handleExportImage = async () => {
    setExporting(true)
    setExportType('image')

    try {
      // 动态导入 html2canvas 以减少初始加载
      const html2canvas = (await import('html2canvas')).default
      
      // 获取故事内容元素
      const element = document.querySelector('.story-content') as HTMLElement
      if (!element) {
        throw new Error('找不到内容元素')
      }

      const canvas = await html2canvas(element, {
        scale: 2, // 高分辨率
        useCORS: true, // 允许跨域图片
        allowTaint: false,
        backgroundColor: '#ffffff',
      })

      // 转换为图片并下载
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `travel-story-${shareId}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export image error:', error)
      alert('导出图片失败，请重试')
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    setExportType('pdf')

    try {
      const response = await fetch(`/api/stories/${storyId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf' }),
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const { downloadUrl } = await response.json()
      
      // 下载文件
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `travel-story-${shareId}.pdf`
      link.click()
    } catch (error) {
      console.error('Export PDF error:', error)
      alert('导出PDF失败，请重试')
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportImage}
        disabled={exporting}
        loading={exporting && exportType === 'image'}
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        导出图片
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={exporting}
        loading={exporting && exportType === 'pdf'}
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        导出PDF
      </Button>
    </div>
  )
}
