'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Package, Mail, Phone, AlertCircle, Loader2, Plus } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string | null
  slug: string
  price: number | null
  stock_type: string
  stock_quantity: number
}

interface OrderItem {
  id: string
  book_id: string
  quantity: number
  unit_price: number
  books: Book | null
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

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-[#fef3c7] text-[#92400e]' },
  confirmado: { label: 'Confirmado', color: 'bg-[#dbeafe] text-[#1e40af]' },
  enviado: { label: 'Enviado', color: 'bg-[#e0e7ff] text-[#3730a3]' },
  entregado: { label: 'Entregado', color: 'bg-[#d1fae5] text-[#065f46]' },
  cancelado: { label: 'Cancelado', color: 'bg-[#fee2e2] text-[#991b1b]' },
}

const statusFlow = ['pendiente', 'confirmado', 'enviado', 'entregado']

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [orderId, setOrderId] = useState<string>('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditItem, setShowEditItem] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState(1)

  useEffect(() => {
    params.then((resolved) => {
      setOrderId(resolved.id)
    })
  }, [params])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  async function fetchOrder() {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        alert('Pedido no encontrado')
        router.push('/dashboard/pedidos')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      alert('Error al cargar pedido')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      const data = await response.json()
      setOrder({ ...order!, status: data.status, updated_at: data.updated_at })
      setShowStatusDropdown(false)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar pedido')
      }

      router.push('/dashboard/pedidos')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar')
      setDeleting(false)
    }
  }

  async function updateItemQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, quantity: newQuantity }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar')
      }

      await fetchOrder()
      setShowEditItem(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#b7b7b5]" />
      </div>
    )
  }

  if (!order) return null

  const canModify = order.status === 'pendiente'
  const isCancelled = order.status === 'cancelado'

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pedidos"
            className="p-2 rounded-[8px] text-[#7b7974] hover:bg-[#f8f8f6] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[24px] font-[400] text-[#121212]" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
              Pedido #{order.id.substring(0, 8)}
            </h1>
            <p className="text-[14px] text-[#7b7974]">
              Creado el {new Date(order.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCancelled && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="p-2 rounded-[8px] text-[#b7b7b5] hover:text-[#d97757] hover:bg-[#fef3f0] transition-colors disabled:opacity-50"
              title="Eliminar pedido"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#7b7974]" />
            <div className="text-[14px] font-[500] text-[#121212]">Estado del pedido</div>
          </div>

          {/* Status Badge / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={updating || isCancelled}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-[500] transition-colors ${
                statusConfig[order.status]?.color
              } ${isCancelled ? 'cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {statusConfig[order.status]?.label || order.status}
              {!isCancelled && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {showStatusDropdown && !isCancelled && (
              <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#e7e6e1] overflow-hidden z-10">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateStatus(status)
                      setShowStatusDropdown(false)
                    }}
                    disabled={updating}
                    className={`w-full px-4 py-2.5 text-left text-[13px] hover:bg-[#f8f8f6] transition-colors ${
                      order.status === status ? 'bg-[#f8f8f6] font-[500]' : ''
                    }`}
                  >
                    <span className={`inline-block px-2 py-0.5 rounded-[6px] text-[11px] ${config.color}`}>
                      {config.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="mt-6 pt-6 border-t border-[#e7e6e1]">
            <div className="flex items-center justify-between">
              {statusFlow.map((status, index) => {
                const currentIndex = statusFlow.indexOf(order.status)
                const isActive = index <= currentIndex
                const isPast = index < currentIndex

                return (
                  <div key={status} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-[500] transition-colors ${
                          isActive
                            ? 'bg-[#121212] text-[#f8f8f6]'
                            : 'bg-[#efeeeb] text-[#b7b7b5]'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`mt-2 text-[11px] ${
                          isActive ? 'text-[#121212] font-[500]' : 'text-[#b7b7b5]'
                        }`}
                      >
                        {statusConfig[status]?.label}
                      </span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div
                        className={`flex-1 h-[2px] mx-2 ${
                          isPast ? 'bg-[#121212]' : 'bg-[#e7e6e1]'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-6 pt-6 border-t border-[#e7e6e1]">
            <div className="flex items-center gap-2 p-3 bg-[#fee2e2] rounded-[8px] text-[13px] text-[#991b1b]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Este pedido fue cancelado. El stock fue restaurado automáticamente.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
          <h2 className="text-[16px] font-[500] text-[#121212] mb-4">
            Información del cliente
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-[500] text-[#7b7974] uppercase tracking-wide mb-1">
                Nombre
              </div>
              <div className="text-[14px] font-[400] text-[#121212]">
                {order.customer_name}
              </div>
            </div>

            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#b7b7b5]" />
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-[14px] text-[#373734] hover:text-[#121212] transition-colors"
                >
                  {order.customer_phone}
                </a>
              </div>
            )}

            {order.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#b7b7b5]" />
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-[14px] text-[#373734] hover:text-[#121212] transition-colors"
                >
                  {order.customer_email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
          <h2 className="text-[16px] font-[500] text-[#121212] mb-4">
            Notas
          </h2>

          {order.notes ? (
            <p className="text-[14px] text-[#373734]">{order.notes}</p>
          ) : (
            <p className="text-[14px] text-[#b7b7b5] italic">Sin notas</p>
          )}
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-[500] text-[#121212]">
            Libros ({order.items.length})
          </h2>
          {canModify && (
            <button
              onClick={() => {/* TODO: Add item modal */}}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-[500] text-[#373734] hover:text-[#121212] hover:bg-[#f8f8f6] rounded-[6px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          )}
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-[12px]"
            >
              <div className="flex-1 min-w-0 mr-4">
                {item.books ? (
                  <>
                    <Link
                      href={`/dashboard/libros/${item.books.slug}/edit`}
                      className="text-[14px] font-[500] text-[#121212] hover:underline"
                    >
                      {item.books.title}
                    </Link>
                    <div className="mt-1 text-[12px] text-[#7b7974]">
                      {item.books.author || 'Sin autor'}
                    </div>
                  </>
                ) : (
                  <div className="text-[14px] text-[#7b7974] italic">
                    Libro no encontrado
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                {showEditItem === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-center bg-white border border-[#e7e6e1] rounded-[6px] text-[14px]"
                    />
                    <button
                      onClick={() => updateItemQuantity(item.id, editQuantity)}
                      disabled={updating}
                      className="text-[13px] font-[500] text-[#121212] hover:underline"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setShowEditItem(null)}
                      className="text-[13px] text-[#7b7974] hover:underline"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-[14px] text-[#373734]">
                      {item.quantity} × ${item.unit_price.toFixed(2)}
                    </div>
                    <div className="w-[80px] text-right text-[14px] font-[500] text-[#121212]">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] mt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] text-[#7b7974]">Subtotal</span>
          <span className="text-[14px] text-[#121212]">${order.total_amount.toFixed(2)}</span>
        </div>
        <div className="pt-4 border-t border-[#e7e6e1]">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-[500] text-[#121212]">Total</span>
            <span className="text-[24px] font-[500] text-[#121212]">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-6 max-w-[400px] w-full mx-4 shadow-2xl">
            <h3 className="text-[18px] font-[500] text-[#121212] mb-2">Eliminar pedido</h3>
            <p className="text-[14px] text-[#7b7974] mb-6">
              ¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.
              {order.status !== 'cancelado' && ' El stock será restaurado automáticamente.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-[14px] font-[500] text-[#373734] hover:text-[#121212] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#d97757] text-white text-[14px] font-[500] rounded-[8px] hover:bg-[#c96a4d] transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
