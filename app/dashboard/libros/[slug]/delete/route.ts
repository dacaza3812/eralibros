import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await params

    // Find book by slug to get UUID
    const { data: book, error: findError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', resolvedParams.slug)
      .single()

    if (findError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('books')
      .update({ is_active: false })
      .eq('id', book.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/dashboard/libros')
    
    // Return HTML with redirect for form submission
    return new NextResponse(
      `<html><head><meta http-equiv="refresh" content="0;url=/dashboard/libros"></head><body></body></html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
