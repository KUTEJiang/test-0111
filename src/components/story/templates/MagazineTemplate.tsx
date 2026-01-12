import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Story, StorySection } from '@/types'

interface MagazineTemplateProps {
  story: Story
}

export function MagazineTemplate({ story }: MagazineTemplateProps) {
  const { title, subtitle, optimizedContent, selectedPhotos } = story
  const sections = optimizedContent?.sections || []
  const heroPhoto = selectedPhotos[0]

  return (
    <article className="magazine-template bg-white">
      {/* Hero Section */}
      <header className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {heroPhoto && (
          <Image
            src={heroPhoto.imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {sections.map((section, index) => (
          <MagazineSection
            key={section.id}
            section={section}
            photos={selectedPhotos.filter(p => p.memoId === section.id)}
            isFirst={index === 0}
            layout={index % 3} // 轮换布局
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 py-12 text-center">
        <p className="text-slate-500 text-sm">
          旅行故事生成器
        </p>
      </footer>
    </article>
  )
}

interface MagazineSectionProps {
  section: StorySection
  photos: typeof Story.prototype.selectedPhotos
  isFirst: boolean
  layout: number
}

function MagazineSection({ section, photos, isFirst, layout }: MagazineSectionProps) {
  const hasMultiplePhotos = photos.length > 1
  const mainPhoto = photos[0]
  const secondaryPhotos = photos.slice(1, 3)

  return (
    <section className={`mb-16 ${isFirst ? '' : 'pt-8 border-t border-slate-200'}`}>
      {/* Section Title */}
      {section.title && (
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          {section.title}
        </h2>
      )}

      {/* Date */}
      {section.date && (
        <p className="text-sm text-slate-500 mb-4">
          {formatDate(section.date, 'long')}
        </p>
      )}

      {/* Layout variations */}
      {layout === 0 && (
        // Layout 1: Full width image + text
        <>
          {mainPhoto && (
            <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
              <Image
                src={mainPhoto.imageUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="prose prose-lg max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        </>
      )}

      {layout === 1 && (
        // Layout 2: Image left + text right
        <div className="md:flex md:gap-8">
          {mainPhoto && (
            <div className="md:w-1/2 mb-6 md:mb-0">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={mainPhoto.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="md:w-1/2 md:flex md:flex-col md:justify-center">
            <div className="prose prose-lg">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {layout === 2 && (
        // Layout 3: Text + image grid
        <>
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:mr-2 first-letter:float-left">
              {section.content}
            </p>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.slice(0, 3).map((photo, idx) => (
                <div
                  key={photo.imageUrl}
                  className={`relative rounded-lg overflow-hidden ${
                    idx === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                  }`}
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
        </>
      )}

      {/* Additional photos */}
      {hasMultiplePhotos && secondaryPhotos.length > 0 && layout !== 2 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {secondaryPhotos.map(photo => (
            <div key={photo.imageUrl} className="relative aspect-[4/3] rounded-lg overflow-hidden">
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
    </section>
  )
}
