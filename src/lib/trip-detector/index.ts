import { differenceInDays, min, max, format } from 'date-fns'
import type { Memo, DetectedTrip, TripDetectionResult } from '@/types'

interface MemoCluster {
  memos: Memo[]
  startDate: Date
  endDate: Date
  tags: string[]
  locations: string[]
}

/**
 * 计算两个日期之间的接近度分数
 * 日期越接近，分数越高
 */
function calculateDateProximityScore(date1: Date, date2: Date): number {
  const daysDiff = Math.abs(differenceInDays(date1, date2))
  
  if (daysDiff <= 1) return 1.0    // 同一天或相邻天
  if (daysDiff <= 3) return 0.9    // 3天内
  if (daysDiff <= 7) return 0.7    // 一周内
  if (daysDiff <= 14) return 0.5   // 两周内
  if (daysDiff <= 30) return 0.3   // 一个月内
  return 0.1                        // 超过一个月
}

/**
 * 计算两组标签的重叠度
 */
function calculateTagOverlapScore(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0
  
  const set1 = new Set(tags1.map(t => t.toLowerCase()))
  const set2 = new Set(tags2.map(t => t.toLowerCase()))
  
  let overlap = 0
  set1.forEach(tag => {
    if (set2.has(tag)) overlap++
  })
  
  const totalUnique = new Set([...set1, ...set2]).size
  return overlap / totalUnique
}

/**
 * 计算两个地点的相似度
 */
function calculateLocationScore(loc1?: string | null, loc2?: string | null): number {
  if (!loc1 || !loc2) return 0.5 // 无地点信息时给中等分数
  
  const normalize = (s: string) => s.toLowerCase().trim()
  
  if (normalize(loc1) === normalize(loc2)) return 1.0
  
  // 检查是否包含关系（如"东京" vs "东京迪士尼"）
  if (normalize(loc1).includes(normalize(loc2)) || 
      normalize(loc2).includes(normalize(loc1))) {
    return 0.8
  }
  
  return 0.2
}

/**
 * 从标题中提取行程信息
 * 支持格式如：日本Day1、京都第二天、东京行-DAY3 等
 */
function parseTitlePattern(title: string): { tripName?: string; dayNumber?: number } {
  const patterns = [
    /^(.+?)(?:Day|DAY|day|第)[\s-]*(\d+)/,      // "日本Day1", "京都第1天"
    /^(.+?)[\s-]+(?:第)?(\d+)(?:天|日)/,        // "东京行-第3天"
    /^(.+?)[\(\（](\d+)[\)\）]/,                // "北海道(1)"
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return {
        tripName: match[1].trim(),
        dayNumber: parseInt(match[2]),
      }
    }
  }
  
  return {}
}

/**
 * 计算两个标题的相似度
 */
function calculateTitleSimilarityScore(title1: string, title2: string): number {
  const parsed1 = parseTitlePattern(title1)
  const parsed2 = parseTitlePattern(title2)
  
  // 如果都有行程名称且相同
  if (parsed1.tripName && parsed2.tripName) {
    const name1 = parsed1.tripName.toLowerCase()
    const name2 = parsed2.tripName.toLowerCase()
    
    if (name1 === name2) return 1.0
    if (name1.includes(name2) || name2.includes(name1)) return 0.8
  }
  
  return 0
}

/**
 * 计算两个memo的相似度分数
 */
function calculateSimilarityScore(memo1: Memo, memo2: Memo): number {
  const dateScore = calculateDateProximityScore(new Date(memo1.date), new Date(memo2.date))
  const tagScore = calculateTagOverlapScore(memo1.tags, memo2.tags)
  const locationScore = calculateLocationScore(memo1.location, memo2.location)
  const titleScore = calculateTitleSimilarityScore(memo1.title, memo2.title)
  
  // 加权平均
  // 日期权重40%, 标签30%, 标题20%, 地点10%
  return (dateScore * 0.4) + (tagScore * 0.3) + (titleScore * 0.2) + (locationScore * 0.1)
}

/**
 * 使用层次聚类算法将memos分组
 */
function clusterMemos(memos: Memo[], threshold: number = 0.5): MemoCluster[] {
  if (memos.length === 0) return []
  if (memos.length === 1) {
    const memo = memos[0]
    return [{
      memos: [memo],
      startDate: new Date(memo.date),
      endDate: new Date(memo.date),
      tags: memo.tags,
      locations: memo.location ? [memo.location] : [],
    }]
  }

  // 初始化：每个memo一个簇
  let clusters: MemoCluster[] = memos.map(memo => ({
    memos: [memo],
    startDate: new Date(memo.date),
    endDate: new Date(memo.date),
    tags: [...memo.tags],
    locations: memo.location ? [memo.location] : [],
  }))

  // 层次聚类
  while (clusters.length > 1) {
    let bestScore = 0
    let bestI = -1
    let bestJ = -1

    // 找到最相似的两个簇
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const score = calculateClusterSimilarity(clusters[i], clusters[j])
        if (score > bestScore) {
          bestScore = score
          bestI = i
          bestJ = j
        }
      }
    }

    // 如果最高相似度低于阈值，停止合并
    if (bestScore < threshold) break

    // 合并两个簇
    const merged = mergeClusters(clusters[bestI], clusters[bestJ])
    clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ)
    clusters.push(merged)
  }

  return clusters
}

/**
 * 计算两个簇的相似度
 */
function calculateClusterSimilarity(c1: MemoCluster, c2: MemoCluster): number {
  // 使用平均链接法
  let totalScore = 0
  let count = 0

  for (const m1 of c1.memos) {
    for (const m2 of c2.memos) {
      totalScore += calculateSimilarityScore(m1, m2)
      count++
    }
  }

  return count > 0 ? totalScore / count : 0
}

/**
 * 合并两个簇
 */
function mergeClusters(c1: MemoCluster, c2: MemoCluster): MemoCluster {
  const allMemos = [...c1.memos, ...c2.memos]
  const dates = allMemos.map(m => new Date(m.date))
  
  return {
    memos: allMemos,
    startDate: min(dates),
    endDate: max(dates),
    tags: [...new Set([...c1.tags, ...c2.tags])],
    locations: [...new Set([...c1.locations, ...c2.locations])],
  }
}

/**
 * 为簇生成行程名称
 */
function generateTripName(cluster: MemoCluster): string {
  // 尝试从标题提取
  for (const memo of cluster.memos) {
    const parsed = parseTitlePattern(memo.title)
    if (parsed.tripName) {
      return parsed.tripName
    }
  }

  // 使用地点
  if (cluster.locations.length > 0) {
    return `${cluster.locations[0]}之旅`
  }

  // 使用标签
  if (cluster.tags.length > 0) {
    return `${cluster.tags[0]}行程`
  }

  // 使用日期
  return `${format(cluster.startDate, 'M月d日')}的旅行`
}

/**
 * 主函数：检测行程
 */
export function detectTrips(memos: Memo[]): TripDetectionResult {
  // 按日期排序
  const sortedMemos = [...memos].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // 聚类
  const clusters = clusterMemos(sortedMemos, 0.5)

  // 转换为DetectedTrip
  const trips: DetectedTrip[] = []
  const assignedMemoIds = new Set<string>()

  for (const cluster of clusters) {
    // 只有包含2个以上memo的簇才算行程
    if (cluster.memos.length >= 2) {
      const avgScore = cluster.memos.length > 1
        ? calculateAverageClusterScore(cluster)
        : 1.0

      trips.push({
        name: generateTripName(cluster),
        startDate: cluster.startDate,
        endDate: cluster.endDate,
        location: cluster.locations[0] || '',
        confidence: Math.min(avgScore, 1.0),
        memoIds: cluster.memos.map(m => m.id),
      })

      cluster.memos.forEach(m => assignedMemoIds.add(m.id))
    }
  }

  // 未分配的memo
  const unassigned = sortedMemos.filter(m => !assignedMemoIds.has(m.id))

  return { trips, unassigned }
}

/**
 * 计算簇内平均相似度
 */
function calculateAverageClusterScore(cluster: MemoCluster): number {
  if (cluster.memos.length <= 1) return 1.0

  let totalScore = 0
  let count = 0

  for (let i = 0; i < cluster.memos.length; i++) {
    for (let j = i + 1; j < cluster.memos.length; j++) {
      totalScore += calculateSimilarityScore(cluster.memos[i], cluster.memos[j])
      count++
    }
  }

  return count > 0 ? totalScore / count : 0
}

export { calculateSimilarityScore, parseTitlePattern }
