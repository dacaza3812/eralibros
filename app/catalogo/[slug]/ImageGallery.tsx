'use client'

import { useState } from 'react'

interface Image {
  id: string
  image_url: string
  alt_text: string | null
  order_index: number
}

interface ImageGalleryProps {
  images: Image[]
  bookTitle: string
}

export default function ImageGallery({ images, bookTitle }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index)
  const selectedImage = sortedImages[selectedIndex]

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-[3/4] w-full rounded-[12px] overflow-hidden bg-white">
        <img
          src={selectedImage.image_url}
          alt={selectedImage.alt_text || bookTitle}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-[80px] h-[100px] rounded-[8px] overflow-hidden bg-white cursor-pointer transition-all ${
                index === selectedIndex
                  ? 'ring-2 ring-[#121212]'
                  : 'hover:ring-2 hover:ring-[#d97757]'
              }`}
              aria-label={`Ver imagen ${index + 1}`}>
              <img
                src={img.image_url}
                alt={img.alt_text || 'Imagen del libro'}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
