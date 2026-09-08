import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, description, updated_at')
      .order('key')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
    }

    // Transform array to key-value object for easier consumption
    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
      }
      return acc
    }, {} as Record<string, { value: string; description: string | null; updated_at: string }>)

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
