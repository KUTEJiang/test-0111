import { MemoImage } from './memo'

export type TemplateType = 'MAGAZINE' | 'CARD' | 'TIMELINE'

export interface SelectedPhoto {
  memoId: string
  imageUrl: string
  score: number
  reason: string
  analysis?: ImageAnalysisResult
}

export interface StorySection {
  id: string
  title?: string
  content: string
  originalContent: string
  images: MemoImage[]
  date?: Date
}

export interface OptimizedContent {
  title: string
  subtitle?: string
  sections: StorySection[]
}

export interface StyleConfig {
  primaryColor?: string
  secondaryColor?: string
  fontStyle?: 'modern' | 'classic' | 'minimal'
}

export interface Story {
  id: string
  tripId?: string | null
  title: string
  subtitle?: string | null
  template: TemplateType
  selectedPhotos: SelectedPhoto[]
  optimizedContent: OptimizedContent
  styleConfig: StyleConfig
  shareId: string
  isPublic: boolean
  views: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date | null
  memoIds?: string[]
}

export interface GenerateStoryInput {
  memoIds: string[]
  template: TemplateType
  photoCount?: number
  optimizeContent?: boolean
}

export interface ImageAnalysisResult {
  clarity: number
  composition: number
  appeal: number
  subject: string
  mainColors: string[]
  description: string
}
