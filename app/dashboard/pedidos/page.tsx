import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { Suspense } from 'react'
import { OrderFilters } from './OrderFilters'

interface OrderItem {
  id: string
  book_id: string
  quantity: number
  unit_price: number
  books: {
    id: string
    title: string
    author: string | null
    slug: string
  } | null
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}

interface SearchParams {
  search?: string
  status?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-[#fef3c7] text-[#92400e]' },
  confirmado: { label: 'Confirmado', color: 'bg-[#dbeafe] text-[#1e40af]' },
  enviado: { label: 'Enviado', color: 'bg-[#e0e7ff] text-[#3730a3]' },
  entregado: { label: 'Entregado', color: 'bg-[#d1fae5] text-[#065f46]' },
  cancelado: { label: 'Cancelado', color: 'bg-[#fee2e2] text-[#991b1b]' },
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Build query
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        id,
        book_id,
        quantity,
        unit_price,
        books (
          id,
          title,
          author,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.or(`customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%,customer_phone.ilike.%${params.search}%`)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[30px] font-[400] text-[#121212]" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
          Pedidos
        </h2>
        <Link
          href="/dashboard/pedidos/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </Link>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">Cargando filtros...</div>}>
        <OrderFilters />
      </Suspense>

      {/* Table Card */}
      <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f8f6] border-b border-[#e7e6e1]">
              <tr>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  ID
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Cliente
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Items
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Fecha
                </th>
                <th className="text-right px-6 py-3 text-[12px] font-[500] text-[#373734] uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e6e1]">
              {orders && orders.length > 0 ? (
                orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-[#f8f8f6]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#7b7974] font-mono">
                        {order.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-[500] text-[#121212]">
                          {order.customer_name}
                        </span>
                        {order.customer_email && (
                          <span className="text-[12px] text-[#7b7974]">
                            {order.customer_email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#373734]">
                        {order.items?.length || 0} libro{order.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[500] text-[#121212]">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-[500] ${
                          statusConfig[order.status]?.color || 'bg-[#efeeeb] text-[#7b7974]'
                        }`}
                      >
                        {statusConfig[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-[400] text-[#7b7974]">
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/pedidos/${order.id}`}
                          className="p-1.5 rounded-[6px] text-[#373734] hover:bg-[#121212]/5 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-[#7b7974]">
                      No se encontraron pedidos
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
