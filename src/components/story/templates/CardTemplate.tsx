import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Story, StorySection } from '@/types'

interface CardTemplateProps {
  story: Story
}

export function CardTemplate({ story }: CardTemplateProps) {
  const { title, subtitle, optimizedContent, selectedPhotos, styleConfig } = story
  const sections = optimizedContent?.sections || []
  const primaryColor = styleConfig?.primaryColor || '#7c3aed'

  return (
    <article className="card-template min-h-screen bg-slate-100">
      {/* Header */}
      <header 
        className="py-12 px-6 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </header>

      {/* Cards Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {sections.map((section, index) => (
          <StoryCard
            key={section.id}
            section={section}
            photos={selectedPhotos.filter(p => p.memoId === section.id)}
            primaryColor={primaryColor}
            index={index}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-slate-400 text-sm">
          旅行故事生成器
        </p>
      </footer>
    </article>
  )
}

interface StoryCardProps {
  section: StorySection
  photos: typeof Story.prototype.selectedPhotos
  primaryColor: string
  index: number
}

function StoryCard({ section, photos, primaryColor, index }: StoryCardProps) {
  const mainPhoto = photos[0]
  const hasImage = !!mainPhoto

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card Image */}
      {hasImage && (
        <div className="relative aspect-[16/10]">
          <Image
            src={mainPhoto.imageUrl}
            alt=""
            fill
            className="object-cover"
          />
          {/* Image overlay with day indicator */}
          {section.date && (
            <div 
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              {formatDate(section.date, 'long')}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {section.title && (
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            {section.title}
          </h3>
        )}
        
        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </p>

        {/* Additional photos grid */}
        {photos.length > 1 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {photos.slice(1, 4).map(photo => (
              <div 
                key={photo.imageUrl}
                className="relative aspect-square rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
