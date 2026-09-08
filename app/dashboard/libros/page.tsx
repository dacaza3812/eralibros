import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit2 } from 'lucide-react'
import { DeleteBookButton } from './DeleteBookButton'
import { BookFilters } from './BookFilters'
import { Suspense } from 'react'

interface Book {
  id: string
  slug: string
  title: string
  author: string | null
  price: number | null
  stock_type: string
  stock_quantity: number
  is_active: boolean
  category_id: string | null
  categories: { name: string } | null
}

interface SearchParams {
  search?: string
  category?: string
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('order_index')

  // Build query
  let query = supabase
    .from('books')
    .select(
      `
      id,
      slug,
      title,
      author,
      price,
      stock_type,
      stock_quantity,
      is_active,
      category_id,
      categories!books_category_id_fkey ( name )
    `
    )
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  const { data: books } = await query

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[30px] font-[400] text-[#121212]">Libros</h2>
        <Link
          href="/dashboard/libros/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo libro
        </Link>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">Cargando filtros...</div>}>
        <BookFilters categories={categories} />
      </Suspense>

      {/* Table Card */}
      <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f8f6] border-b border-[#e7e6e1]">
              <tr>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Título
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Autor
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Categoría
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Precio
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-right px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e6e1]">
              {books && books.length > 0 ? (
                books.map((book: Book) => (
                  <tr key={book.id} className="hover:bg-[#f8f8f6]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#121212]">
                        {book.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#373734]">
                        {book.author || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#373734]">
                        {book.categories?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#121212]">
                        {book.price ? `$${Number(book.price).toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-[400] text-[#121212]">
                          {book.stock_type === 'impreso_listo'
                            ? 'Impreso listo'
                            : 'Bajo demanda 48h'}
                        </span>
                        <span className="text-[11px] font-[400] text-[#7b7974]">
                          Cantidad: {book.stock_quantity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-[500] ${
                          book.is_active
                            ? 'bg-[#121212]/5 text-[#121212]'
                            : 'bg-[#b7b7b5]/20 text-[#7b7974]'
                        }`}>
                        {book.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/libros/${book.slug}/edit`}
                          className="p-1.5 rounded-[6px] text-[#373734] hover:bg-[#121212]/5 transition-colors"
                          title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteBookButton bookSlug={book.slug} bookTitle={book.title} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-[#7b7974]">
                      No se encontraron libros
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
