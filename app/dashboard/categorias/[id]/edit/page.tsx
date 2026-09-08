'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  order_index: z.number().int().min(0, 'Debe ser un número positivo'),
})

type FormData = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormOutput>({
    resolver: zodResolver(schema),
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (nameValue !== undefined) {
      setAutoSlug(slugify(nameValue))
    }
  }, [nameValue])

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/categories/${categoryId}`)
        if (!response.ok) throw new Error('Error al cargar categoría')
        
        const data = await response.json()
        setOriginalSlug(data.slug)
        
        reset({
          name: data.name,
          description: data.description || '',
          order_index: data.order_index,
        })
        
        setAutoSlug(data.slug)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId, reset])

  const onSubmit = async (data: FormOutput) => {
    setSaving(true)
    setError(null)

    try {
      const slug = autoSlug || slugify(data.name)
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug,
          description: data.description || null,
          order_index: data.order_index,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar categoría')
      }

      router.push('/dashboard/categorias')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#7b7974] text-[14px]">Cargando categoría...</div>
      </div>
    )
  }

  return (
    <div className="max-w-[600px]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/categorias"
          className="inline-flex items-center gap-1 text-[#7b7974] hover:text-[#121212] text-[14px] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a categorías
        </Link>
        <h1 className="text-[24px] font-[400] text-[#121212] mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
          Editar categoría
        </h1>
        <p className="text-[14px] text-[#7b7974]">
          Modifica los datos de esta categoría.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-[#fef3f0] border border-[#d97757]/20 rounded-[8px] p-4 text-[14px] text-[#d97757]">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-[14px] font-[500] text-[#121212] mb-2">
            Nombre *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Ej: Ficción, Poesía, Ensayo..."
            className="w-full px-4 py-3 bg-white border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#121212] transition-colors"
          />
          {errors.name && (
            <p className="mt-1 text-[13px] text-[#d97757]">{errors.name.message}</p>
          )}
        </div>

        {/* Slug Preview */}
        {autoSlug && (
          <div>
            <label className="block text-[14px] font-[500] text-[#121212] mb-2">
              Slug (autogenerado)
            </label>
            <div className="px-4 py-3 bg-[#efeeeb] rounded-[8px] text-[14px] text-[#7b7974]">
              {autoSlug}
            </div>
            {autoSlug !== originalSlug && (
              <p className="mt-1 text-[12px] text-[#7b7974]">
                El slug cambiará de "{originalSlug}" a "{autoSlug}"
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-[14px] font-[500] text-[#121212] mb-2">
            Descripción
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            placeholder="Describe brevemente esta categoría..."
            className="w-full px-4 py-3 bg-white border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#121212] transition-colors resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-[13px] text-[#d97757]">{errors.description.message}</p>
          )}
        </div>

        {/* Order Index */}
        <div>
          <label htmlFor="order_index" className="block text-[14px] font-[500] text-[#121212] mb-2">
            Orden
          </label>
          <input
            {...register('order_index', { valueAsNumber: true })}
            type="number"
            id="order_index"
            min="0"
            step="1"
            placeholder="0"
            className="w-[120px] px-4 py-3 bg-white border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#121212] transition-colors"
          />
          <p className="mt-1 text-[12px] text-[#7b7974]">
            Las categorías se ordenan de menor a mayor.
          </p>
          {errors.order_index && (
            <p className="mt-1 text-[13px] text-[#d97757]">{errors.order_index.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href="/dashboard/categorias"
            className="px-6 py-3 bg-white text-[#373734] text-[14px] font-[500] rounded-[8px] hover:bg-[#efeeeb] transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
