import { createClient } from '@/lib/supabase/server'
import { createClient as createPublicClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ImageGallery from './ImageGallery'

interface Book {
  id: string
  title: string
  slug: string
  description: string | null
  author: string | null
  year: number | null
  isbn: string | null
  price: number | null
  stock_type: 'impreso_listo' | 'bajo_demanda_48h'
  stock_quantity: number
  categories: { name: string; slug: string } | null
  book_images: Array<{
    id: string
    image_url: string
    alt_text: string | null
    order_index: number
  }>
}

export async function generateStaticParams() {
  // Use public client for static generation (no cookies needed)
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
  
  const { data: books } = await supabase
    .from('books')
    .select('slug')
    .eq('is_active', true)

  return books?.map((book) => ({
    slug: book.slug,
  })) ?? []
}

async function getBook(slug: string): Promise<Book | null> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      description,
      author,
      year,
      isbn,
      price,
      stock_type,
      stock_quantity,
      categories (
        name,
        slug
      ),
      book_images (
        id,
        image_url,
        alt_text,
        order_index
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data as Book | null
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const book = await getBook(resolvedParams.slug)

  if (!book) {
    notFound()
  }

  const whatsappNumber = '58864240'
  const getMessage = () =>
    encodeURIComponent(
      `Hola, me interesa el libro: ${book.title}${book.author ? ` de ${book.author}` : ''}. ¿Está disponible?`
    )

  // Sort images by order_index
  const sortedImages = book.book_images.sort((a, b) => a.order_index - b.order_index)
  const mainImage = sortedImages[0]
  const category = book.categories

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
          {/* Back link */}
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[14px] font-[500] text-[#7b7974] hover:text-[#373734] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>

          <div className="bg-white rounded-[16px] overflow-hidden shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Images */}
              <div className="p-8 bg-[#f8f8f6]">
                {sortedImages.length > 0 ? (
                  <ImageGallery images={sortedImages} bookTitle={book.title} />
                ) : (
                  <div className="aspect-[3/4] w-full rounded-[12px] bg-white flex items-center justify-center">
                    <p className="text-[14px] font-[400] text-[#9c9a92]">
                      Sin imagen
                    </p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-8 lg:p-12">
                {category && (
                  <span className="inline-block px-3 py-1 rounded-[4px] bg-[#d97757]/10 text-[#d97757] text-[12px] font-[500] uppercase tracking-[1px] mb-4">
                    {category.name}
                  </span>
                )}

                <h1 className="text-[36px] font-[400] leading-[1.2] text-[#121212] tracking-tight mb-3">
                  {book.title}
                </h1>

                {book.author && (
                  <p className="text-[18px] font-[400] text-[#373734] mb-4">
                    {book.author}
                    {book.year && (
                      <span className="text-[14px] font-[400] text-[#9c9a92] ml-2">
                        ({book.year})
                      </span>
                    )}
                  </p>
                )}

                {/* Stock badge */}
                <div className="mb-6">
                  {book.stock_type === 'impreso_listo' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#10b981]/10 text-[#10b981] text-[14px] font-[500]">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#d97757]/10 text-[#d97757] text-[14px] font-[500]">
                      <span className="w-2 h-2 rounded-full bg-[#d97757]" />
                      Bajo demanda (48h)
                    </span>
                  )}
                </div>

                {book.description && (
                  <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-[16px] font-[400] leading-[1.7] text-[#373734] whitespace-pre-line">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {book.isbn && (
                    <div>
                      <p className="text-[12px] font-[500] text-[#9c9a92] uppercase tracking-[1px] mb-1">
                        ISBN
                      </p>
                      <p className="text-[14px] font-[400] text-[#373734]">
                        {book.isbn}
                      </p>
                    </div>
                  )}
                  {book.year && !book.author && (
                    <div>
                      <p className="text-[12px] font-[500] text-[#9c9a92] uppercase tracking-[1px] mb-1">
                        Año
                      </p>
                      <p className="text-[14px] font-[400] text-[#373734]">
                        {book.year}
                      </p>
                    </div>
                  )}
                </div>

                {/* Price */}
                {book.price && (
                  <div className="mb-8">
                    <p className="text-[12px] font-[500] text-[#9c9a92] uppercase tracking-[1px] mb-2">
                      Precio
                    </p>
                    <p className="text-[32px] font-[500] text-[#121212]">
                      ${book.price.toLocaleString('es-AR')}
                    </p>
                  </div>
                )}

                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${getMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-[#10b981] text-white text-[16px] font-[500] rounded-[8px] hover:bg-[#059669] transition-colors w-full justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Consultar disponibilidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
