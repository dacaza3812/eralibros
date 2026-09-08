import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params

    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        categories ( id, name ),
        images:book_images ( id, image_url, image_path, order_index )
      `)
      .eq('slug', resolvedParams.slug)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params
    const body = await request.json()

    const { title, slug, description, author, year, isbn, price, category_id, stock_type, stock_quantity, is_active } = body

    const { data, error } = await supabase
      .from('books')
      .update({
        title,
        slug,
        description: description || null,
        author: author || null,
        year: year || null,
        isbn: isbn || null,
        price: price || null,
        category_id: category_id || null,
        stock_type,
        stock_quantity,
        is_active,
      })
      .eq('slug', resolvedParams.slug)
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
