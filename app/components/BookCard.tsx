'use client'

import Link from 'next/link'

interface BookCardProps {
  book: {
    id: string
    title: string
    slug: string
    author: string | null
    year?: number | null
    categories?: Array<{ name: string; slug: string }> | null
    book_images: Array<{
      image_url: string
      alt_text: string | null
    }>
  }
  variant?: 'featured' | 'classic'
}

export function BookCard({ book, variant = 'featured' }: BookCardProps) {
  const mainImage = book.book_images?.[0]

  if (variant === 'classic') {
    return (
      <Link
        href={`/catalogo/${book.slug}`}
        className="group">
        <div className="bg-white rounded-[12px] overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Book Cover */}
          <div className="aspect-[3/4] relative bg-[#f8f8f6]">
            {mainImage ? (
              <img
                src={mainImage.image_url}
                alt={mainImage.alt_text || book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-14 border-2 border-[#d97757]/30 rounded" />
              </div>
            )}
          </div>
          
          {/* Book Info */}
          <div className="p-4">
            <h3 className="text-[16px] font-[400] text-[#121212] mb-1 leading-[1.3] group-hover:text-[#d97757] transition-colors line-clamp-2">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-[13px] font-[400] text-[#7b7974] line-clamp-1">
                {book.author}
              </p>
            )}
            {book.year && (
              <p className="text-[11px] font-[400] text-[#9c9a92] mt-1">
                {book.year}
              </p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Featured variant (default)
  return (
    <Link
      href={`/catalogo/${book.slug}`}
      className="group">
      <div className="bg-white rounded-[16px] overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Book Cover */}
        <div className="aspect-[3/4] relative bg-[#f8f8f6]">
          {mainImage ? (
            <img
              src={mainImage.image_url}
              alt={mainImage.alt_text || book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-12 h-16 mx-auto mb-3 border-2 border-[#d97757]/30 rounded" />
                <p className="text-[#9c9a92] text-[12px] font-[400]">
                  Vista previa no disponible
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Book Info */}
        <div className="p-6">
          {book.categories && book.categories[0] && (
            <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
              {book.categories[0].name}
            </span>
          )}
          <h3 className="text-[18px] font-[400] text-[#121212] mt-2 mb-1 leading-[1.4] group-hover:text-[#d97757] transition-colors">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-[14px] font-[400] text-[#7b7974] mb-3">
              {book.author}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
