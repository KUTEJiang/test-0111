export interface MemoImage {
  url: string
  width?: number
  height?: number
  metadata?: {
    takenAt?: string
    location?: string
    camera?: string
  }
}

export interface Memo {
  id: string
  title: string
  content: string
  images: MemoImage[]
  tags: string[]
  date: Date
  location?: string | null
  tripId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateMemoInput {
  title: string
  content: string
  images?: MemoImage[]
  tags?: string[]
  date: Date
  location?: string
}

export interface UpdateMemoInput {
  title?: string
  content?: string
  images?: MemoImage[]
  tags?: string[]
  date?: Date
  location?: string
  tripId?: string | null
}
