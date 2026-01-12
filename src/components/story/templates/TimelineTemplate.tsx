import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Story, StorySection } from '@/types'

interface TimelineTemplateProps {
  story: Story
}

export function TimelineTemplate({ story }: TimelineTemplateProps) {
  const { title, subtitle, optimizedContent, selectedPhotos, styleConfig } = story
  const sections = optimizedContent?.sections || []
  const primaryColor = styleConfig?.primaryColor || '#7c3aed'

  return (
    <article className="timeline-template min-h-screen bg-white">
      {/* Header */}
      <header className="py-16 px-6 text-center border-b border-slate-200">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </header>

      {/* Timeline Container */}
      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Vertical line */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
          style={{ backgroundColor: primaryColor + '30' }}
        />

        {/* Timeline items */}
        <div className="space-y-12 md:space-y-0">
          {sections.map((section, index) => (
            <TimelineItem
              key={section.id}
              section={section}
              photos={selectedPhotos.filter(p => p.memoId === section.id)}
              primaryColor={primaryColor}
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>

      {/* End marker */}
      <div className="flex justify-center py-8">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-200">
        <p className="text-slate-400 text-sm">
          旅行故事生成器
        </p>
      </footer>
    </article>
  )
}

interface TimelineItemProps {
  section: StorySection
  photos: typeof Story.prototype.selectedPhotos
  primaryColor: string
  index: number
  isLeft: boolean
}

function TimelineItem({ section, photos, primaryColor, index, isLeft }: TimelineItemProps) {
  const mainPhoto = photos[0]

  return (
    <div 
      className={`
        relative md:flex md:items-center
        ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
        animate-fade-in
      `}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Timeline dot - desktop */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 hidden md:block z-10">
        <div 
          className="w-4 h-4 rounded-full ring-4 ring-white"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Content side */}
      <div className={`md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
        {/* Date badge */}
        {section.date && (
          <div 
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white mb-4 ${
              isLeft ? 'md:ml-auto' : ''
            }`}
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(section.date, 'long')}
          </div>
        )}

        {/* Title */}
        {section.title && (
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            {section.title}
          </h3>
        )}

        {/* Content */}
        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </p>
      </div>

      {/* Image side */}
      <div className={`md:w-1/2 mt-6 md:mt-0 ${isLeft ? 'md:pl-12' : 'md:pr-12'}`}>
        {mainPhoto && (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={mainPhoto.imageUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Additional photos */}
        {photos.length > 1 && (
          <div className="flex gap-2 mt-2">
            {photos.slice(1, 3).map(photo => (
              <div 
                key={photo.imageUrl}
                className="relative flex-1 aspect-square rounded-lg overflow-hidden"
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

      {/* Mobile timeline dot */}
      <div className="absolute left-0 top-0 md:hidden">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="w-0.5 h-full ml-[5px] mt-1"
          style={{ backgroundColor: primaryColor + '30' }}
        />
      </div>
    </div>
  )
}
