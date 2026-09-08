import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `books/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('books-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('books-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      image_url: urlData.publicUrl,
      image_path: data.path,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
