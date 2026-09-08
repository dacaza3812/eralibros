'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, X, AlertCircle, Loader2 } from 'lucide-react'

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
  book_id: string
  quantity: number
  unit_price: number
  book: Book
}

// Status config备用 - will be used in order detail page

export default function NewOrderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [showBookSearch, setShowBookSearch] = useState(false)

  async function fetchBooks() {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.filter((b: Book) => b.price !== null))
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  // Fetch books on mount
  useEffect(() => {
    fetchBooks()
  }, [])

  // Filter books based on search - using useMemo instead of useEffect
  const filteredBooks = searchQuery.length > 0
    ? books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []
  
  const searching = searchQuery.length > 0
  // Calculate total
  const total = items.reduce((sum, item) => {
    return sum + item.quantity * item.unit_price
  }, 0)

  // Check if quantity exceeds stock
  function exceedsStock(book: Book, quantity: number): boolean {
    if (book.stock_type !== 'impreso_listo') return false
    return quantity > book.stock_quantity
  }

  // Add item to order
  function addItem(book: Book) {
    const existingItem = items.find((item) => item.book_id === book.id)
    
    if (existingItem) {
      // Check stock before incrementing
      if (book.stock_type === 'impreso_listo' && existingItem.quantity >= book.stock_quantity) {
        alert(`Stock máximo disponible: ${book.stock_quantity}`)
        return
      }
      
      setItems(
        items.map((item) =>
          item.book_id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setItems([
        ...items,
        {
          book_id: book.id,
          quantity: 1,
          unit_price: book.price || 0,
          book,
        },
      ])
    }
    
    setSearchQuery('')
    setShowBookSearch(false)
  }

  // Update quantity
  function updateQuantity(bookId: string, quantity: number) {
    if (quantity < 1) {
      removeItem(bookId)
      return
    }

    const item = items.find((i) => i.book_id === bookId)
    if (item && exceedsStock(item.book, quantity)) {
      alert(`Stock máximo disponible: ${item.book.stock_quantity}`)
      return
    }

    setItems(
      items.map((item) =>
        item.book_id === bookId ? { ...item, quantity } : item
      )
    )
  }

  // Remove item
  function removeItem(bookId: string) {
    setItems(items.filter((item) => item.book_id !== bookId))
  }

  // Submit order
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!customerName.trim()) {
      alert('El nombre del cliente es requerido')
      return
    }

    if (items.length === 0) {
      alert('Debes agregar al menos un libro')
      return
    }

    // Check stock for all items
    for (const item of items) {
      if (exceedsStock(item.book, item.quantity)) {
        alert(`Stock insuficiente para "${item.book.title}"`)
        return
      }
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone || null,
          customer_email: customerEmail || null,
          notes: notes || null,
          items: items.map(({ book_id, quantity, unit_price }) => ({
            book_id,
            quantity,
            unit_price,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear pedido')
      }

      const order = await response.json()
      router.push(`/dashboard/pedidos/${order.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-[400] text-[#121212] mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
          Nuevo pedido
        </h1>
        <p className="text-[14px] text-[#7b7974]">
          Crea un pedido para un cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-[16px] p-8 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
          <h2 className="text-[16px] font-[500] text-[#121212] mb-6">
            Información del cliente
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[12px] font-[500] text-[#373734] mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors"
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[12px] font-[500] text-[#373734] mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors"
                placeholder="Número de teléfono"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[12px] font-[500] text-[#373734] mb-2">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[12px] font-[500] text-[#373734] mb-2">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors resize-none"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white rounded-[16px] p-8 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-[500] text-[#121212]">
              Libros ({items.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowBookSearch(!showBookSearch)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar libro
            </button>
          </div>

          {/* Book Search */}
          {showBookSearch && (
            <div className="mb-6 p-4 bg-[#f8f8f6] rounded-[12px] border border-[#e7e6e1]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b7b5]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o autor..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors"
                />
              </div>

              {searching && (
                <div className="max-h-[240px] overflow-y-auto space-y-1">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => addItem(book)}
                        className="w-full flex items-center justify-between p-3 bg-white rounded-[8px] hover:bg-[#f8f8f6] transition-colors text-left"
                      >
                        <div>
                          <div className="text-[14px] font-[500] text-[#121212]">
                            {book.title}
                          </div>
                          <div className="text-[12px] text-[#7b7974]">
                            {book.author || 'Sin autor'} •{' '}
                            {book.stock_type === 'impreso_listo'
                              ? `Stock: ${book.stock_quantity}`
                              : 'Bajo demanda'}
                          </div>
                        </div>
                        <div className="text-[14px] font-[500] text-[#121212]">
                          ${book.price?.toFixed(2)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[14px] text-[#7b7974]">
                      No se encontraron libros
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.book_id}
                  className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-[12px]"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-[14px] font-[500] text-[#121212] truncate">
                        {item.book.title}
                      </div>
                      {item.book.stock_type === 'impreso_listo' && 
                        item.quantity > item.book.stock_quantity && (
                        <AlertCircle className="w-4 h-4 text-[#d97757] flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#7b7974]">
                      ${item.unit_price.toFixed(2)} c/u
                      {item.book.stock_type === 'impreso_listo' && (
                        <span className="ml-2">
                          {' '}
                          • Stock: {item.book.stock_quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#e7e6e1] rounded-[6px] text-[#373734] hover:bg-[#f8f8f6] transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-[14px] font-[500] text-[#121212]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-[#e7e6e1] rounded-[6px] text-[#373734] hover:bg-[#f8f8f6] transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-[80px] text-right">
                      <div className="text-[14px] font-[500] text-[#121212]">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.book_id)}
                      className="w-8 h-8 flex items-center justify-center text-[#b7b7b5] hover:text-[#d97757] hover:bg-[#fef3f0] rounded-[6px] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[14px] text-[#7b7974]">
              No hay libros en el pedido
            </div>
          )}
        </div>

        {/* Summary Card */}
        {items.length > 0 && (
          <div className="bg-white rounded-[16px] p-8 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-[500] text-[#121212]">
                Resumen
              </h2>
              <div className="text-[24px] font-[500] text-[#121212]">
                ${total.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {items.map((item) => (
                <div
                  key={item.book_id}
                  className="flex items-center justify-between text-[14px]"
                >
                  <span className="text-[#373734]">
                    {item.book.title} × {item.quantity}
                  </span>
                  <span className="text-[#121212]">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e7e6e1]">
              <div className="flex items-center justify-between text-[16px] font-[500] text-[#121212]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-[14px] font-[500] text-[#373734] hover:text-[#121212] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creando...' : 'Crear pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
