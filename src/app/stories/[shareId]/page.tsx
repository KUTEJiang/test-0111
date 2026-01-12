import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { MagazineTemplate, CardTemplate, TimelineTemplate } from '@/components/story/templates'
import type { Story as StoryType, SelectedPhoto, OptimizedContent, StyleConfig } from '@/types'

interface SharePageProps {
  params: { shareId: string }
}

async function getStory(shareId: string) {
  const story = await prisma.story.findUnique({
    where: { shareId },
  })

  if (!story || !story.isPublic) {
    return null
  }

  // 增加浏览次数
  await prisma.story.update({
    where: { id: story.id },
    data: { views: { increment: 1 } },
  })

  return story
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const story = await getStory(params.shareId)

  if (!story) {
    return {
      title: '页面不存在',
    }
  }

  const selectedPhotos = story.selectedPhotos as SelectedPhoto[]
  const coverImage = selectedPhotos[0]?.imageUrl

  return {
    title: story.title,
    description: story.subtitle || '一段难忘的旅行故事',
    openGraph: {
      title: story.title,
      description: story.subtitle || '一段难忘的旅行故事',
      type: 'article',
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: story.title,
      description: story.subtitle || '一段难忘的旅行故事',
      images: coverImage ? [coverImage] : undefined,
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const dbStory = await getStory(params.shareId)

  if (!dbStory) {
    notFound()
  }

  // 转换为前端类型
  const story: StoryType = {
    id: dbStory.id,
    tripId: dbStory.tripId,
    title: dbStory.title,
    subtitle: dbStory.subtitle,
    template: dbStory.template,
    selectedPhotos: dbStory.selectedPhotos as SelectedPhoto[],
    optimizedContent: dbStory.optimizedContent as OptimizedContent,
    styleConfig: dbStory.styleConfig as StyleConfig,
    shareId: dbStory.shareId,
    isPublic: dbStory.isPublic,
    views: dbStory.views,
    createdAt: dbStory.createdAt,
    updatedAt: dbStory.updatedAt,
    publishedAt: dbStory.publishedAt,
  }

  // 根据模板类型渲染
  switch (story.template) {
    case 'MAGAZINE':
      return <MagazineTemplate story={story} />
    case 'CARD':
      return <CardTemplate story={story} />
    case 'TIMELINE':
      return <TimelineTemplate story={story} />
    default:
      return <CardTemplate story={story} />
  }
}
