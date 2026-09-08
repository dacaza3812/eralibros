import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get stats
  const { count: totalBooks } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: whatsappRequests } = await supabase
    .from('whatsapp_requests')
    .select('*', { count: 'exact', head: true })

  const { data: recentBooks } = await supabase
    .from('books')
    .select('title, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: popularBooks } = await supabase
    .from('books')
    .select('title, views_count')
    .eq('is_active', true)
    .order('views_count', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-[1200px]">
      <div className="mb-8">
        <h2 className="text-[30px] font-[400] text-[#121212] mb-2">
          Bienvenido al panel
        </h2>
        <p className="text-[14px] font-[400] text-[#7b7974]">
          Gestiona tu catálogo de libros desde aquí
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[16px] p-6">
          <p className="text-[12px] font-[500] text-[#7b7974] uppercase tracking-[1px] mb-2">
            Total Libros
          </p>
          <p className="text-[40px] font-[400] text-[#121212]">
            {totalBooks || 0}
          </p>
        </div>

        <div className="bg-white rounded-[16px] p-6">
          <p className="text-[12px] font-[500] text-[#7b7974] uppercase tracking-[1px] mb-2">
            Categorías
          </p>
          <p className="text-[40px] font-[400] text-[#121212]">
            {totalCategories || 0}
          </p>
        </div>

        <div className="bg-white rounded-[16px] p-6">
          <p className="text-[12px] font-[500] text-[#7b7974] uppercase tracking-[1px] mb-2">
            Consultas WhatsApp
          </p>
          <p className="text-[40px] font-[400] text-[#121212]">
            {whatsappRequests || 0}
          </p>
        </div>

        <div className="bg-white rounded-[16px] p-6">
          <p className="text-[12px] font-[500] text-[#7b7974] uppercase tracking-[1px] mb-2">
            Este mes
          </p>
          <p className="text-[40px] font-[400] text-[#10b981]">
            Activo
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[16px] p-8 mb-8">
        <h3 className="text-[18px] font-[500] text-[#121212] mb-6">
          Acciones rápidas
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/libros/new"
            className="flex items-center gap-3 px-4 py-3 bg-[#121212] text-[#f8f8f6] rounded-[8px] hover:bg-[#000000] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[14px] font-[500]">Agregar libro</span>
          </Link>

          <Link
            href="/dashboard/categorias/new"
            className="flex items-center gap-3 px-4 py-3 bg-[#f8f8f6] text-[#121212] rounded-[8px] hover:bg-[#efebeb] transition-colors border border-[#121212]/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[14px] font-[500]">Agregar categoría</span>
          </Link>

          <Link
            href="/dashboard/pedidos"
            className="flex items-center gap-3 px-4 py-3 bg-[#f8f8f6] text-[#121212] rounded-[8px] hover:bg-[#efebeb] transition-colors border border-[#121212]/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-[14px] font-[500]">Ver pedidos</span>
          </Link>
        </div>
      </div>

      {/* Recent & Popular */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[16px] p-8">
          <h3 className="text-[18px] font-[500] text-[#121212] mb-6">
            Libros recientes
          </h3>
          <ul className="space-y-4">
            {recentBooks?.map((book, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-[14px] font-[400] text-[#373734]">
                  {book.title}
                </span>
                <span className="text-[12px] font-[400] text-[#9c9a92]">
                  {new Date(book.created_at).toLocaleDateString('es-AR')}
                </span>
              </li>
            ))}
            {(!recentBooks || recentBooks.length === 0) && (
              <li className="text-[14px] font-[400] text-[#7b7974]">
                No hay libros todavía
              </li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-[16px] p-8">
          <h3 className="text-[18px] font-[500] text-[#121212] mb-6">
            Más consultados
          </h3>
          <ul className="space-y-4">
            {popularBooks?.map((book, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-[14px] font-[400] text-[#373734]">
                  {book.title}
                </span>
                <span className="text-[12px] font-[400] text-[#9c9a92]">
                  {book.views_count || 0} vistas
                </span>
              </li>
            ))}
            {(!popularBooks || popularBooks.length === 0) && (
              <li className="text-[14px] font-[400] text-[#7b7974]">
                No hay datos todavía
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
