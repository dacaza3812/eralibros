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
    const body = await request.json()
    const { images } = body

    // Get book UUID from slug
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', resolvedParams.slug)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Insert new images
    if (images && images.length > 0) {
      const imagesToInsert = images.map((img: { path: string; url: string; order_index: number }) => ({
        book_id: book.id,
        image_url: img.url,
        image_path: img.path,
        order_index: img.order_index,
      }))

      const { error } = await supabase
        .from('book_images')
        .insert(imagesToInsert)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    revalidatePath('/dashboard/libros')
    return NextResponse.json({ success: true })
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
    const { images, deleteIds } = body

    // Get book UUID from slug
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', resolvedParams.slug)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Delete images
    if (deleteIds && deleteIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('book_images')
        .delete()
        .in('id', deleteIds)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 })
      }
    }

    // Separate new images from existing ones
    const newImages = images.filter((img: { id: string; isNew?: boolean }) => img.isNew)
    const existingImages = images.filter((img: { id: string; isNew?: boolean }) => !img.isNew)

    // Insert new images
    if (newImages.length > 0) {
      const imagesToInsert = newImages.map((img: { path: string; url: string; order_index: number }) => ({
        book_id: book.id,
        image_url: img.url,
        image_path: img.path,
        order_index: img.order_index,
      }))

      const { error: insertError } = await supabase
        .from('book_images')
        .insert(imagesToInsert)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }

    // Update existing images order
    if (existingImages.length > 0) {
      for (const img of existingImages) {
        const { error } = await supabase
          .from('book_images')
          .update({ order_index: img.order_index })
          .eq('id', img.id)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      }
    }

    revalidatePath('/dashboard/libros')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
