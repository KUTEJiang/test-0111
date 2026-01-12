import { Memo } from './memo'

export interface Trip {
  id: string
  name: string
  startDate: Date
  endDate: Date
  location: string
  confidence: number
  createdAt: Date
  updatedAt: Date
  memos?: Memo[]
}

export interface DetectedTrip {
  name: string
  startDate: Date
  endDate: Date
  location: string
  confidence: number
  memoIds: string[]
}

export interface TripDetectionResult {
  trips: DetectedTrip[]
  unassigned: Memo[]
}
