import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-[system-ui]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#121212] text-[#f8f8f6] p-6 flex flex-col">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[8px] bg-[#f8f8f6] flex items-center justify-center">
            <span className="text-[#121212] text-[14px] font-[500]">ℰ</span>
          </div>
          <span className="text-[16px] font-[500]">Admin</span>
        </Link>

        <nav className="space-y-2 flex-1">
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Dashboard
          </Link>
          <Link
            href="/dashboard/libros"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Libros
          </Link>
          <Link
            href="/dashboard/categorias"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Categorías
          </Link>
          <Link
            href="/dashboard/pedidos"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Pedidos WhatsApp
          </Link>
          <Link
            href="/dashboard/configuracion"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Configuración
          </Link>
        </nav>

        <div className="space-y-2">
          <Link
            href="/"
            className="block px-3 py-2 rounded-[8px] text-[14px] font-[400] hover:bg-white/10 transition-colors">
            Ver catálogo →
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-[240px]">
        <header className="sticky top-0 z-40 border-b border-[#121212]/5 bg-[#f8f8f6]/90 backdrop-blur-xl px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-[500] text-[#121212]">Panel de administración</h1>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-white text-[#373734] text-[14px] font-[500] rounded-[8px] hover:bg-[#efebeb] transition-colors">
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
