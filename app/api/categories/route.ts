import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get categories with book count
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        order_index,
        is_active,
        created_at,
        updated_at,
        books(count)
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
    }

    // Transform the data to flatten book_count
    const transformedData = categories?.map(cat => ({
      ...cat,
      book_count: cat.books?.[0]?.count || 0,
      books: undefined,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, order_index } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        order_index: order_index ?? 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
