import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const { book_id, quantity, unit_price } = body

    if (!book_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Libro y cantidad son requeridos' },
        { status: 400 }
      )
    }

    // Check if order exists and is in a state that allows modifications
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Only allow modifications if order is pending
    if (order.status !== 'pendiente') {
      return NextResponse.json(
        { error: 'Solo se pueden modificar pedidos pendientes' },
        { status: 400 }
      )
    }

    // Check book and stock
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, stock_quantity, stock_type, price')
      .eq('id', book_id)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 400 })
    }

    if (book.stock_type === 'impreso_listo' && book.stock_quantity < quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${book.stock_quantity}` },
        { status: 400 }
      )
    }

    // Use provided price or book price
    const finalPrice = unit_price || book.price || 0

    // Add item (triggers stock decrease)
    const { data: item, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: id,
        book_id,
        quantity,
        unit_price: finalPrice,
      })
      .select()
      .single()

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 400 })
    }

    // Update total
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, unit_price')
      .eq('order_id', id)

    const total_amount = items?.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0) || 0

    await supabase
      .from('orders')
      .update({ total_amount })
      .eq('id', id)

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error adding order item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const { item_id, quantity } = body

    if (!item_id || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Item ID y cantidad son requeridos' },
        { status: 400 }
      )
    }

    // Check if order exists and is pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.status !== 'pendiente') {
      return NextResponse.json(
        { error: 'Solo se pueden modificar pedidos pendientes' },
        { status: 400 }
      )
    }

    // Get current item
    const { data: currentItem, error: itemError } = await supabase
      .from('order_items')
      .select('*, books!inner(stock_quantity, stock_type)')
      .eq('id', item_id)
      .eq('order_id', id)
      .single()

    if (itemError || !currentItem) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
    }

    const quantityDiff = quantity - currentItem.quantity

    // If increasing quantity, check stock
    if (quantityDiff > 0 && currentItem.books.stock_type === 'impreso_listo') {
      if (currentItem.books.stock_quantity < quantityDiff) {
        return NextResponse.json(
          { error: `Stock insuficiente. Disponible: ${currentItem.books.stock_quantity}` },
          { status: 400 }
        )
      }
    }

    // If quantity is being increased, we need to manually decrease stock
    // If quantity is being decreased, we need to manually increase stock
    // This is complex with triggers, so we'll handle it differently:
    // Delete the old item and create a new one

    // For simplicity, just update the quantity and handle stock difference manually
    // But triggers won't fire for updates, so we need to manage stock manually
    
    // Delete the item first (this will NOT restore stock because we're in pending state)
    await supabase.from('order_items').delete().eq('id', item_id)

    // Create new item with new quantity (trigger will decrease stock)
    const { data: newItem, error: createError } = await supabase
      .from('order_items')
      .insert({
        order_id: id,
        book_id: currentItem.book_id,
        quantity,
        unit_price: currentItem.unit_price,
      })
      .select()
      .single()

    if (createError) {
      // Restore the original item on failure
      await supabase.from('order_items').insert({
        order_id: id,
        book_id: currentItem.book_id,
        quantity: currentItem.quantity,
        unit_price: currentItem.unit_price,
      })
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Update order total
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, unit_price')
      .eq('order_id', id)

    const total_amount = items?.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0) || 0

    await supabase
      .from('orders')
      .update({ total_amount })
      .eq('id', id)

    return NextResponse.json(newItem)
  } catch (error) {
    console.error('Error updating order item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const url = new URL(request.url)
    const item_id = url.searchParams.get('item_id')

    if (!item_id) {
      return NextResponse.json(
        { error: 'Item ID es requerido' },
        { status: 400 }
      )
    }

    // Check if order exists and is pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.status !== 'pendiente') {
      return NextResponse.json(
        { error: 'Solo se pueden modificar pedidos pendientes' },
        { status: 400 }
      )
    }

    // Get item before deleting (for stock restoration)
    const { data: item, error: itemError } = await supabase
      .from('order_items')
      .select('book_id, quantity, books!inner(id, stock_type)')
      .eq('id', item_id)
      .eq('order_id', id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
    }

    // Normalize books data (Supabase returns it as array or object depending on join)
    const bookData = Array.isArray(item.books) ? item.books[0] : item.books as { id: string; stock_type: string }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('id', item_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // Manually restore stock for printed books (items delete doesn't trigger stock restore)
    if (bookData.stock_type === 'impreso_listo') {
      await supabase.rpc('restore_stock_for_item', {
        p_book_id: item.book_id,
        p_quantity: item.quantity
      })
    }

    // Update order total
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, unit_price')
      .eq('order_id', id)

    const total_amount = items?.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price
    }, 0) || 0

    await supabase
      .from('orders')
      .update({ total_amount })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
