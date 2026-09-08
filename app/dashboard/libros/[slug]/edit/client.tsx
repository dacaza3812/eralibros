'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const bookSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  author: z.string().optional(),
  year: z.number().int().min(1000).max(2100).optional().or(z.literal(undefined)),
  isbn: z.string().optional(),
  price: z.number().min(0).optional().or(z.literal(undefined)),
  category_id: z.string().optional(),
  stock_type: z.enum(['impreso_listo', 'bajo_demanda_48h']),
  stock_quantity: z.number().int().min(0),
  is_active: z.boolean(),
})

type BookFormData = z.infer<typeof bookSchema>

interface Category {
  id: string
  name: string
}

interface Image {
  id: string
  url: string
  path: string
  order_index: number
  isNew?: boolean
  toDelete?: boolean
}

function SortableImage({
  image,
  onRemove,
}: {
  image: Image
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-[12px] overflow-hidden bg-[#efeeeb] ${
        isDragging ? 'shadow-lg' : ''
      } ${image.toDelete ? 'opacity-40' : ''}`}>
      <div className="aspect-[3/4] relative">
        <img
          src={image.url}
          alt="Imagen del libro"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 bg-white/90 rounded-[6px] cursor-grab hover:bg-white">
            <GripVertical className="w-4 h-4 text-[#373734]" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-[6px] opacity-0 group-hover:opacity-100 hover:bg-[#d97757] hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
        {image.order_index === 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#121212] text-[#f8f8f6] text-[10px] font-[500] rounded-[4px]">
            Principal
          </div>
        )}
        {image.toDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[12px] font-[500] text-white">
              Se eliminará
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditBookPageClient({ bookSlug }: { bookSlug: string }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  })

  const title = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setValue('slug', slug)
    }
  }, [title, setValue])

  // Fetch book data and categories
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch book
        const bookRes = await fetch(`/api/books/${bookSlug}`)
        if (!bookRes.ok) throw new Error('Error al cargar el libro')
        const bookData = await bookRes.json()

        // Reset form with book data
        reset({
          title: bookData.title,
          slug: bookData.slug,
          description: bookData.description || '',
          author: bookData.author || '',
          year: bookData.year || undefined,
          isbn: bookData.isbn || '',
          price: bookData.price || undefined,
          category_id: bookData.category_id || '',
          stock_type: bookData.stock_type,
          stock_quantity: bookData.stock_quantity,
          is_active: bookData.is_active,
        })

        // Set images
        if (bookData.images) {
          setImages(
            bookData.images.map((img: { id: string; image_url: string; image_path: string; order_index: number }) => ({
              id: img.id,
              url: img.image_url,
              path: img.image_path,
              order_index: img.order_index,
            }))
          )
        }

        // Fetch categories
        const catRes = await fetch('/api/categories')
        const catData = await catRes.json()
        setCategories(catData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bookSlug, reset])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === String(active.id))
        const newIndex = items.findIndex((item) => item.id === String(over.id))
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          order_index: idx,
        }))
        return newItems
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', files[0])

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await res.json()
      const newImage: Image = {
        id: `temp-${Date.now()}`,
        url: data.image_url,
        path: data.image_path,
        order_index: images.length,
        isNew: true,
      }

      setImages([...images, newImage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (id: string) => {
    setImages(
      images.map((img) =>
        img.id === id
          ? img.isNew
            ? null
            : { ...img, toDelete: true }
          : img
      ).filter(Boolean) as Image[]
    )
  }

  const onSubmit = async (data: BookFormData) => {
    setSaving(true)
    setError(null)

    try {
      // Update book
      const bookRes = await fetch(`/api/books/${bookSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!bookRes.ok) {
        const errData = await bookRes.json()
        throw new Error(errData.error || 'Error al actualizar el libro')
      }

      // Update images
      const imagesToSave = images.filter((img) => !img.toDelete)
      const imagesToDelete = images.filter((img) => img.toDelete)

      if (imagesToSave.length > 0 || imagesToDelete.length > 0) {
        const imagesRes = await fetch(`/api/books/${bookSlug}/images`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: imagesToSave,
            deleteIds: imagesToDelete.map((img) => img.id),
          }),
        })

        if (!imagesRes.ok) {
          throw new Error('Error al actualizar las imágenes')
        }
      }

      router.push('/dashboard/libros')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el libro')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[14px] text-[#7b7974]">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/libros"
          className="p-2 rounded-[8px] hover:bg-[#121212]/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#373734]" />
        </Link>
        <h2 className="text-[30px] font-[400] text-[#121212]">Editar libro</h2>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-[16px] p-8 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px] space-y-6">
          {/* Error message */}
          {error && (
            <div className="px-4 py-3 bg-[#d97757]/10 border border-[#d97757]/20 rounded-[8px] text-[14px] text-[#d97757]">
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-[500] text-[#121212]">
              Información básica
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Título *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
                {errors.title && (
                  <p className="text-[12px] text-[#d97757] mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  {...register('slug')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
                {errors.slug && (
                  <p className="text-[12px] text-[#d97757] mt-1">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                Descripción
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] resize-none focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="author"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Autor
                </label>
                <input
                  type="text"
                  id="author"
                  {...register('author')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Año
                </label>
                <input
                  type="number"
                  id="year"
                  {...register('year', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="isbn"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  ISBN
                </label>
                <input
                  type="text"
                  id="isbn"
                  {...register('isbn')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Precio
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
              </div>
            </div>
          </div>

          {/* Category and stock */}
          <div className="space-y-4 pt-6 border-t border-[#e7e6e1]">
            <h3 className="text-[16px] font-[500] text-[#121212]">
              Categoría y stock
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Categoría
                </label>
                <select
                  id="category_id"
                  {...register('category_id')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10">
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="stock_type"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Tipo de stock
                </label>
                <select
                  id="stock_type"
                  {...register('stock_type')}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10">
                  <option value="impreso_listo">Impreso listo</option>
                  <option value="bajo_demanda_48h">Bajo demanda 48h</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="stock_quantity"
                  className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                  Cantidad en stock
                </label>
                <input
                  type="number"
                  id="stock_quantity"
                  {...register('stock_quantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 rounded-[4px] border-[#b7b7b5] text-[#121212] focus:ring-2 focus:ring-[#121212]/10"
                  />
                  <span className="text-[14px] font-[400] text-[#373734]">
                    Libro activo
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 pt-6 border-t border-[#e7e6e1]">
            <h3 className="text-[16px] font-[500] text-[#121212]">Imágenes</h3>

            {/* Upload button */}
            <div>
              <label className="block text-[14px] font-[500] text-[#373734] mb-1.5">
                Subir imagen
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-[#b7b7b5] rounded-[8px] bg-[#f8f8f6] hover:bg-[#efeeeb] transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-[#7b7974]" />
                  <span className="text-[14px] text-[#373734]">
                    {uploading ? 'Subiendo...' : 'Click para subir imagen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>
                <SortableContext
                  items={images.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((image) => (
                      <SortableImage
                        key={image.id}
                        image={image}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <p className="text-[12px] text-[#7b7974]">
              Arrastra para reordenar. La primera imagen será la principal.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#e7e6e1]">
            <Link
              href="/dashboard/libros"
              className="px-5 py-2 bg-white border border-[#121212]/10 text-[#373734] text-[14px] font-[500] rounded-[8px] hover:bg-[#f8f8f6] transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
