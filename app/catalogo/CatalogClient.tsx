'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  slug: string
  author: string | null
  price: number | null
  year: number | null
  stock_type: 'impreso_listo' | 'bajo_demanda_48h'
  stock_quantity: number
  book_images: Array<{
    image_url: string
    alt_text: string | null
  }>
  categories: { name: string; slug: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogClientProps {
  initialBooks: Book[]
  categories: Category[]
}

export default function CatalogClient({ initialBooks, categories }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [loading, setLoading] = useState(false)

  // Filter books client-side
  const filteredBooks = books.filter(book => {
    const matchesCategory = !selectedCategory || book.categories?.slug === categories.find(c => c.id === selectedCategory)?.slug
    const matchesSearch = !searchQuery || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const whatsappNumber = '58864240'
  const getMessage = (book: Book) =>
    encodeURIComponent(`Hola, me interesa el libro: ${book.title}${book.author ? ` de ${book.author}` : ''}. ¿Está disponible?`)

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-[system-ui]">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-[#121212]/5 bg-[#f8f8f6]/90 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Eralibros">
              <div className="w-8 h-8 rounded-[8px] bg-[#121212] flex items-center justify-center">
                <span className="text-[#f8f8f6] text-[14px] font-[500]">ℰ</span>
              </div>
              <span className="text-[16px] font-[500] text-[#373734]">
                Eralibros
              </span>
            </Link>

            <Link
              href="/catalogo"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#000000] transition-colors duration-200">
              Catálogo
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-6 py-[80px]">
        <div className="max-w-[960px]">
          <h1 className="text-[48px] font-[400] leading-[1.1] text-[#121212] tracking-tight mb-4">
            Catálogo de libros
          </h1>
          <p className="text-[18px] font-[400] leading-[1.6] text-[#373734] max-w-[720px] mb-8">
            Explorá nuestra colección de libros impresos y bajo demanda.
          </p>

          {/* Filters */}
          <div className="mb-12 space-y-6">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-[400px] px-4 py-3 bg-white rounded-[8px] border border-[#121212]/10 text-[14px] font-[400] text-[#373734] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#d97757] transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-[8px] text-[14px] font-[500] transition-colors ${
                  !selectedCategory
                    ? 'bg-[#121212] text-[#f8f8f6]'
                    : 'bg-white text-[#373734] hover:bg-[#efebeb]'
                }`}>
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-[8px] text-[14px] font-[500] transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#121212] text-[#f8f8f6]'
                      : 'bg-white text-[#373734] hover:bg-[#efebeb]'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-[100px]">
              <p className="text-[16px] font-[400] text-[#7b7974]">
                Cargando...
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-[100px]">
              <p className="text-[16px] font-[400] text-[#7b7974]">
                No se encontraron libros con esos criterios.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBooks.map(book => {
                const mainImage = book.book_images?.[0]
                const category = book.categories
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-[16px] p-6 hover:bg-[#efebeb] transition-colors duration-200">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/catalogo/${book.slug}`}>
                          <div className="w-[140px] h-[200px] rounded-[8px] overflow-hidden bg-[#f8f8f6] relative">
                            {mainImage ? (
                              <img
                                src={mainImage.image_url}
                                alt={mainImage.alt_text || book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#9c9a92] text-[12px]">
                                Sin imagen
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        {category && (
                          <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px] mb-2">
                            {category.name}
                          </span>
                        )}
                        <Link href={`/catalogo/${book.slug}`}>
                          <h3 className="text-[18px] font-[400] text-[#121212] mb-2 leading-[1.4] hover:text-[#d97757] transition-colors">
                            {book.title}
                          </h3>
                        </Link>
                        {book.author && (
                          <p className="text-[14px] font-[400] text-[#7b7974] mb-2">
                            {book.author}
                          </p>
                        )}
                        {book.year && (
                          <p className="text-[12px] font-[400] text-[#9c9a92] mb-3">
                            {book.year}
                          </p>
                        )}

                        {/* Stock badge */}
                        <div className="mb-3">
                          {book.stock_type === 'impreso_listo' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-[4px] bg-[#10b981]/10 text-[#10b981] text-[12px] font-[500]">
                              ✓ Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-[4px] bg-[#d97757]/10 text-[#d97757] text-[12px] font-[500]">
                              Bajo demanda (48h)
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        {book.price && (
                          <p className="text-[20px] font-[500] text-[#121212] mb-4">
                            ${book.price.toLocaleString('es-AR')}
                          </p>
                        )}

                        {/* WhatsApp button */}
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${getMessage(book)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white text-[14px] font-[500] rounded-[8px] hover:bg-[#059669] transition-colors mt-auto">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Consultar
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
