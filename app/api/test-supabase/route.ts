import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('books')
      .select('id, title')
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      }
    })
  } catch (err) {
    return NextResponse.json({ error: 'Catch error', details: err }, { status: 500 })
  }
}
