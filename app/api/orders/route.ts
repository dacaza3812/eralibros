import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface OrderItem {
  book_id: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderWithItems extends Order {
  items: Array<{
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
  }>
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      customer_name,
      customer_phone,
      customer_email,
      notes,
      items,
    } = body

    // Validate required fields
    if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Nombre del cliente e items son requeridos' },
        { status: 400 }
      )
    }

    // Verify stock availability before creating order
    for (const item of items) {
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('id, title, stock_quantity, stock_type, price')
        .eq('id', item.book_id)
        .single()

      if (bookError || !book) {
        return NextResponse.json(
          { error: `Libro no encontrado: ${item.book_id}` },
          { status: 400 }
        )
      }

      if (book.stock_type === 'impreso_listo' && book.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${book.title}". Disponible: ${book.stock_quantity}` },
          { status: 400 }
        )
      }

      // Set unit price from book if not provided
      if (!item.unit_price && book.price) {
        item.unit_price = book.price
      }
    }

    // Calculate total
    const total_amount = items.reduce((sum: number, item: OrderItem) => {
      return sum + item.quantity * item.unit_price
    }, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_phone: customer_phone || null,
        customer_email: customer_email || null,
        total_amount,
        notes: notes || null,
        status: 'pendiente',
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    // Create order items (this will trigger stock decrease)
    const orderItems = items.map((item: OrderItem) => ({
      order_id: order.id,
      book_id: item.book_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // If items fail, delete the order (stock trigger already ran)
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
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
      .eq('id', order.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    return NextResponse.json(completeOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
