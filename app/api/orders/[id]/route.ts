import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

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
            slug,
            price,
            stock_type,
            stock_quantity
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching order:', error)
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

    // Only allow updating status and notes
    const updateData: { status?: string; notes?: string | null } = {}
    
    if (body.status) {
      const validStatuses = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // If cancelled, stock is restored automatically by trigger
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating order:', error)
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

    // Check if order exists and get its status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // If order is not cancelled, restore stock before deleting
    if (order.status !== 'cancelado') {
      // Update status to cancelado first (triggers stock restore)
      await supabase
        .from('orders')
        .update({ status: 'cancelado' })
        .eq('id', id)
    }

    // Now delete the order (cascade deletes items)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
