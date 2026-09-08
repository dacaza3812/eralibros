import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/lib/supabase/server'

// Revalidate every 5 minutes
export const revalidate = 300

interface Book {
  id: string
  title: string
  slug: string
  author: string | null
  price: number | null
  year: number | null
  categories: { name: string; slug: string } | null
  book_images: Array<{
    image_url: string
    alt_text: string | null
  }>
}

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch featured books (latest 6)
  const { data: featuredBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      author,
      price,
      year,
      book_images (
        image_url,
        alt_text
      ),
      categories (
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch classic literature books
  const { data: classicBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      slug,
      author,
      price,
      year,
      book_images (
        image_url,
        alt_text
      ),
      categories (
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .order('year', { ascending: true })
    .limit(4)

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
                <span className="text-[#f8f8f6] text-[14px] font-[500]">
                  ℰ
                </span>
              </div>
              <span className="text-[16px] font-[500] text-[#373734]">
                Eralibros
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <ul className="flex items-center gap-8">
                  <li>
                    <Link
                      href="/catalogo"
                      className="text-[14px] font-[400] text-[#373734] hover:text-[#121212] transition-colors duration-200">
                      Catálogo
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/catalogo?herramienta=buscador"
                      className="text-[14px] font-[400] text-[#373734] hover:text-[#121212] transition-colors duration-200">
                      Herramientas
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/recursos"
                      className="text-[14px] font-[400] text-[#373734] hover:text-[#121212] transition-colors duration-200">
                      Recursos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/nosotros"
                      className="text-[14px] font-[400] text-[#373734] hover:text-[#121212] transition-colors duration-200">
                      Nosotros
                    </Link>
                  </li>
                </ul>
              </div>

              <Link
                href="/catalogo"
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#000000] transition-colors duration-200">
                Introducir
                <svg
                  className="w-[14px] h-[14px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <button className="lg:hidden p-2">
                <svg
                  className="w-[20px] h-[20px] text-[#373734]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Minimalist Anthropic Style */}
      <section className="max-w-[1200px] mx-auto px-6 py-[100px]">
        <div className="max-w-[960px]">
          <h1 className="text-[72px] font-[400] leading-[1.1] text-[#121212] tracking-tight mb-6">
            Análisis literario comprehensivo
          </h1>
          <p className="text-[18px] font-[400] leading-[1.6] text-[#373734] max-w-[720px] mb-8">
            Plataforma de investigación bibliográfica con herramientas
            avanzadas de búsqueda y comparación. Explorá, analizad y
            contextualizad obras desde perspectiva crítica.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#000000] transition-colors duration-200">
              Explorar catálogo
              <svg
                className="w-[14px] h-[14px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredBooks && featuredBooks.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-[80px] border-t border-[#121212]/5">
          <div className="max-w-[960px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212]">
                Libros destacados
              </h2>
              <Link
                href="/catalogo"
                className="text-[14px] font-[500] text-[#d97757] hover:text-[#121212] transition-colors duration-200 flex items-center gap-1">
                Ver todos
                <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-[14px] font-[400] text-[#7b7974] mb-12">
              Últimas incorporaciones a nuestra colección
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book) => {
                const mainImage = book.book_images?.[0]
                return (
                  <Link
                    key={book.id}
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
                        {book.categories && (
                          <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                            {book.categories.name}
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
                        {book.price && (
                          <p className="text-[18px] font-[500] text-[#121212]">
                            ${book.price.toLocaleString('es-AR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Classic Literature Section */}
      {classicBooks && classicBooks.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-[80px] border-t border-[#121212]/5">
          <div className="max-w-[960px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212]">
                Literatura clásica
              </h2>
              <Link
                href="/catalogo"
                className="text-[14px] font-[500] text-[#d97757] hover:text-[#121212] transition-colors duration-200 flex items-center gap-1">
                Explorar clásicos
                <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-[14px] font-[400] text-[#7b7974] mb-12">
              Obras atemporales de la literatura universal
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {classicBooks.map((book) => {
                const mainImage = book.book_images?.[0]
                return (
                  <Link
                    key={book.id}
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
              })}
            </div>
          </div>
        </section>
      )}

      {/* Latest Updates - Announcements Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-[80px] border-t border-[#121212]/5">
        <div className="max-w-[960px]">
          <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
            Latest updates
          </h2>
          <p className="text-[14px] font-[400] text-[#7b7974] mb-12">
            Novedades y actualizaciones del sistema
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Link
              href="/catalogo?update=2026-01-filtro-idiomas"
              className="group bg-[#ffffff] rounded-[16px] p-8 hover:bg-[#efebeb] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                  Update
                </span>
                <svg
                  className="w-[16px] h-[16px] text-[#d97757] transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-[18px] font-[400] text-[#121212] mb-2 leading-[1.4]">
                Nuevo: Filtro multi-idioma inicializado
              </h3>
              <p className="text-[14px] font-[400] text-[#373734] leading-[1.6] mb-4">
                Sistema de clasificación para obras en 15 idiomas diferentes.
              </p>
              <div className="flex items-center gap-4 text-[12px] font-[400] text-[#7b7974]">
                <time>Enero 2026</time>
                <span>·</span>
                <span>Actualización del catálogo</span>
              </div>
            </Link>

            <Link
              href="/catalogo?update=2026-01-analisis-ficcion-cientifica"
              className="group bg-[#ffffff] rounded-[16px] p-8 hover:bg-[#efebeb] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                  Analysis
                </span>
                <svg
                  className="w-[16px] h-[16px] text-[#d97757] transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-[18px] font-[400] text-[#121212] mb-2 leading-[1.4]">
                Tendencias en ciencia ficción continental
              </h3>
              <p className="text-[14px] font-[400] text-[#373734] leading-[1.6] mb-4">
                Sobre 1,450 obras de ciencia ficción añadidas desde 2020.
              </p>
              <div className="flex items-center gap-4 text-[12px] font-[400] text-[#7b7974]">
                <time>Enero 2026</time>
                <span>·</span>
                <span>Análisis de contenido</span>
              </div>
            </Link>

            <Link
              href="/catalogo?update=2026-02-herramienta-comparador"
              className="group bg-[#ffffff] rounded-[16px] p-8 hover:bg-[#efebeb] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                  Update
                </span>
                <svg
                  className="w-[16px] h-[16px] text-[#d97757] transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-[18px] font-[400] text-[#121212] mb-2 leading-[1.4]">
                Comparador de obras habilitado
              </h3>
              <p className="text-[14px] font-[400] text-[#373734] leading-[1.6] mb-4">
                Ahora podés analizar similitudes entre múltiples obras literarias.
              </p>
              <div className="flex items-center gap-4 text-[12px] font-[400] text-[#7b7974]">
                <time>Febrero 2026</time>
                <span>·</span>
                <span>Nueva herramienta</span>
              </div>
            </Link>

            <Link
              href="/catálogo?update=2026-02-obras-género-latino"
              className="group bg-[#ffffff] rounded-[16px] p-8 hover:bg-[#efebeb] transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                  Collection
                </span>
                <svg
                  className="w-[16px] h-[16px] text-[#d97757] transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-[18px] font-[400] text-[#121212] mb-2 leading-[1.4]">
                Colección género latino aumentada significativamente
              </h3>
              <p className="text-[14px] font-[400] text-[#373734] leading-[1.6] mb-4">
                Sobre 800 obras de género latino añadidas.
              </p>
              <div className="flex items-center gap-4 text-[12px] font-[400] text-[#7b7974]">
                <time>Febrero 2026</time>
                <span>·</span>
                <span>Colección actualizada</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section - Content-driven */}
      <section className="max-w-[1200px] mx-auto px-6 py-[80px] border-t border-[#121212]/5">
        <div className="max-w-[960px]">
          <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
            Functionality system
          </h2>
          <p className="text-[14px] font-[400] text-[#7b7974] mb-12">
            Sistema de análisis y exploración bibliográfica
          </p>

          <div className="lg:grid lg:grid-cols-2 gap-8">
            <div className="bg-[#ffffff] rounded-[16px] p-10">
              <h3 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
                Parameter analysis
              </h3>
              <p className="text-[16px] font-[400] leading-[1.6] text-[#373734] mb-6">
                Identificad, clasificad y estructurad parámetros temáticos,
                estilísticos y conceptuales de cualquier obra en el catálogo.
              </p>
              <ul className="space-y-4">
                {[
                  "Palabras clave y conceptos principales",
                  "Tropos recurrentes y estructurales",
                  "Elementos meta narrativos",
                  "Tramas y subtramas",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="text-[14px] font-[400] text-[#7b7974] leading-[1.5] flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#d97757] mt-[8px] flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#ffffff] rounded-[16px] p-10">
              <h3 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
                Comparative frameworks
              </h3>
              <p className="text-[16px] font-[400] leading-[1.6] text-[#373734] mb-6">
                Contrastad múltiples obras simultáneamente identificando
                convergencias y divergencias temáticas, estilísticas y contextuales.
              </p>
              <ul className="space-y-4">
                {[
                  "Comparación directa de múltiples obras",
                  "Identificación de patrones recurrentes",
                  "Cross-analysis transversal",
                  "Meta-análisis de colecciones",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="text-[14px] font-[400] text-[#7b7974] leading-[1.5] flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#d97757] mt-[8px] flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="max-w-[1200px] mx-auto px-6 py-[80px]">
        <div className="max-w-[960px]">
          <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
            Featured analysis
          </h2>
          <p className="text-[14px] font-[400] text-[#7b7974] mb-12">
            Análisis destacados del sistema
          </p>

          <div className="bg-[#ffffff] rounded-[16px] p-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[12px] font-[500] text-[#d97757] uppercase tracking-[1px]">
                On y
              </span>
              <span className="text-[12px] font-[500] text-[#7b7974]">
                Enero 2026
              </span>
            </div>
            <h3 className="text-[28px] font-[400] leading-[1.2] text-[#121212] mb-4">
              Gabriel García Márquez: evolución estilística
            </h3>
            <p className="text-[16px] font-[400] leading-[1.6] text-[#373734] mb-6">
              Análisis estructural de la obra de Márquez desde sus inicios en
              One Hundred Years of Solitude hasta su producción más reciente,
              identificando influencias, técnicas narrativas y evolucion de
              matíces estilísticos a través de su extenso catálogo.
            </p>
            <div className="flex items-center gap-8 text-[14px] font-[400] text-[#7b7974]">
              <div>
                <div className="text-[12px] font-[400] text-[#9c9a92] uppercase tracking-[1px] mb-1">
                  Incluye
                </div>
                <div className="font-[500] text-[#373734]">47 obras</div>
              </div>
              <div>
                <div className="text-[12px] font-[400] text-[#9c9a92] uppercase tracking-[1px] mb-1">
                  Análisis
                </div>
                <div className="font-[500] text-[#373734]">5,234 métricas</div>
              </div>
              <Link
                href="/analisis/gabriel-garcia-marquez"
                className="flex items-center gap-2 text-[#121212] hover:text-[#373734] transition-colors duration-200">
                Ver análisis completo
                <svg
                  className="w-[14px] h-[14px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalist */}
      <section className="max-w-[1200px] mx-auto px-6 py-[80px]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-[640px]">
            <h2 className="text-[30px] font-[400] leading-[1.2] text-[#121212] mb-4">
              Explore literature at scale
            </h2>
            <p className="text-[16px] font-[400] leading-[1.6] text-[#373734]">
              Accedé al catálogo completo y explorá obras bajo perspectiva crítica.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#000000] transition-colors duration-200">
            Introducir al catálogo
            <svg
              className="w-[14px] h-[14px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}