import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, slug, description, author, year, isbn, price, category_id, stock_type, stock_quantity, is_active } = body

    const { data, error } = await supabase
      .from('books')
      .insert({
        title,
        slug,
        description: description || null,
        author: author || null,
        year: year || null,
        isbn: isbn || null,
        price: price || null,
        category_id: category_id || null,
        stock_type: stock_type || 'impreso_listo',
        stock_quantity: stock_quantity || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        categories ( name ),
        images:book_images ( id, image_url, image_path, order_index )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
