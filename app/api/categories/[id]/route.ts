import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: category, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 })
    }

    // Transform to flatten book_count
    const transformedData = {
      ...category,
      book_count: category.books?.[0]?.count || 0,
      books: undefined,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, order_index } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description || null
    if (order_index !== undefined) updateData.order_index = order_index

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Soft delete: set is_active to false
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
