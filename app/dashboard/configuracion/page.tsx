'use client'

import { useState, useEffect } from 'react'
import { Save, MessageSquare, Store, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface Settings {
  whatsapp_number: {
    value: string
    description: string | null
    updated_at: string
  }
  whatsapp_message_template: {
    value: string
    description: string | null
    updated_at: string
  }
  site_name: {
    value: string
    description: string | null
    updated_at: string
  }
  site_description: {
    value: string
    description: string | null
    updated_at: string
  }
}

export default function ConfigurationPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form state
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Error al cargar configuración')
      const data = await response.json()
      setSettings(data)
      setWhatsappNumber(data.whatsapp_number?.value || '')
      setMessageTemplate(data.whatsapp_message_template?.value || '')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
  }

  async function saveSetting(key: string, value: string) {
    setSaving(key)
    try {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      showToast('success', 'Configuración actualizada correctamente')
      await fetchSettings()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(null)
    }
  }

  function handleSaveWhatsApp() {
    if (!whatsappNumber.trim()) {
      showToast('error', 'El número de WhatsApp es requerido')
      return
    }
    if (!messageTemplate.trim()) {
      showToast('error', 'La plantilla del mensaje es requerida')
      return
    }
    if (!messageTemplate.includes('{titulo}')) {
      showToast('error', 'La plantilla debe incluir {titulo}')
      return
    }

    // Save both settings
    Promise.all([
      fetch('/api/settings/whatsapp_number', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: whatsappNumber }),
      }),
      fetch('/api/settings/whatsapp_message_template', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: messageTemplate }),
      }),
    ])
      .then(async ([numRes, msgRes]) => {
        if (!numRes.ok) throw new Error('Error al guardar número')
        if (!msgRes.ok) throw new Error('Error al guardar plantilla')
        showToast('success', 'Configuración de WhatsApp actualizada')
        await fetchSettings()
      })
      .catch((err) => {
        showToast('error', err instanceof Error ? err.message : 'Error al guardar')
      })
  }

  function getWhatsAppPreview() {
    const exampleTitle = 'Cien años de soledad'
    const message = messageTemplate.replace('{titulo}', exampleTitle)
    const encodedMessage = encodeURIComponent(message)
    const cleanNumber = whatsappNumber.replace(/\D/g, '')
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#7b7974] text-[14px]">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-[8px] shadow-lg bg-white border border-[#e7e6e1]">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#121212]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#d97757]" />
          )}
          <span className="text-[14px] text-[#121212]">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-[400] text-[#121212] mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
          Configuración
        </h1>
        <p className="text-[14px] text-[#7b7974]">
          Administra las configuraciones globales del sistema.
        </p>
      </div>

      <div className="space-y-6">
        {/* WhatsApp Configuration */}
        <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e7e6e1] flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#121212]" />
            <div>
              <h2 className="text-[14px] font-[500] text-[#121212]">WhatsApp</h2>
              <p className="text-[12px] text-[#7b7974]">Configuración de contacto por WhatsApp</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* WhatsApp Number */}
            <div>
              <label className="block text-[14px] font-[500] text-[#121212] mb-2">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="5491112345678"
                className="w-full px-3 py-2 bg-white border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#b7b7b5] focus:outline-none focus:border-[#121212] transition-colors"
              />
              <p className="mt-1 text-[12px] text-[#7b7974]">
                Número sin símbolos. Ejemplo: 5491112345678 (Argentina +54 +9 + número)
              </p>
            </div>

            {/* Message Template */}
            <div>
              <label className="block text-[14px] font-[500] text-[#121212] mb-2">
                Plantilla del mensaje
              </label>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Hola, me interesa el libro: {titulo}. ¿Está disponible?"
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#b7b7b5] focus:outline-none focus:border-[#121212] transition-colors resize-none"
              />
              <p className="mt-1 text-[12px] text-[#7b7974]">
                Usa <code className="px-1 py-0.5 bg-[#efeeeb] rounded text-[11px]">{'{titulo}'}</code> para insertar el título del libro dinámicamente.
              </p>
            </div>

            {/* Preview */}
            {whatsappNumber && messageTemplate && (
              <div className="bg-[#f8f8f6] rounded-[8px] p-4">
                <p className="text-[12px] font-[500] text-[#7b7974] mb-2">Vista previa del link</p>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-[13px] text-[#121212] break-all font-mono bg-white px-3 py-2 rounded-[6px] border border-[#e7e6e1]">
                      {getWhatsAppPreview()}
                    </p>
                  </div>
                  <a
                    href={getWhatsAppPreview()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-[#e7e6e1] rounded-[6px] text-[12px] text-[#373734] hover:bg-[#f8f8f6] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Probar
                  </a>
                </div>
              </div>
            )}

            {/* Timestamp */}
            {settings?.whatsapp_number?.updated_at && (
              <div className="flex items-center gap-2 text-[12px] text-[#b7b7b5]">
                <Clock className="w-3 h-3" />
                <span>Última actualización: {formatDate(settings.whatsapp_number.updated_at)}</span>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveWhatsApp}
                disabled={saving === 'whatsapp'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving === 'whatsapp' ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>

        {/* Store Information (Future) */}
        <div className="bg-white rounded-[16px] shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] overflow-hidden opacity-60">
          <div className="px-6 py-4 border-b border-[#e7e6e1] flex items-center gap-3">
            <Store className="w-5 h-5 text-[#121212]" />
            <div>
              <h2 className="text-[14px] font-[500] text-[#121212]">Información del negocio</h2>
              <p className="text-[12px] text-[#7b7974]">Próximamente: nombre, email, dirección</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-[500] text-[#121212] mb-2">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  disabled
                  value={settings?.site_name?.value || 'Eralibros'}
                  className="w-full px-3 py-2 bg-[#efeeeb] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#7b7974] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[14px] font-[500] text-[#121212] mb-2">
                  Email de contacto
                </label>
                <input
                  type="email"
                  disabled
                  placeholder="contacto@eralibros.com"
                  className="w-full px-3 py-2 bg-[#efeeeb] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#b7b7b5] cursor-not-allowed"
                />
              </div>
            </div>
            <p className="mt-4 text-[12px] text-[#7b7974] italic">
              Esta sección estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
