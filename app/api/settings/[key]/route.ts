import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = await createClient()
    const { key } = await params
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { value } = body

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'El valor es requerido' }, { status: 400 })
    }

    // Validate specific settings
    if (key === 'whatsapp_number') {
      // Remove any non-digit characters for validation
      const cleanNumber = value.replace(/\D/g, '')
      if (cleanNumber.length < 8) {
        return NextResponse.json({ 
          error: 'El número de WhatsApp debe tener al menos 8 dígitos' 
        }, { status: 400 })
      }
    }

    if (key === 'whatsapp_message_template') {
      if (!value.includes('{titulo}')) {
        return NextResponse.json({ 
          error: 'La plantilla debe incluir el placeholder {titulo}' 
        }, { status: 400 })
      }
    }

    const { data: setting, error } = await supabase
      .from('settings')
      .update({ 
        value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
