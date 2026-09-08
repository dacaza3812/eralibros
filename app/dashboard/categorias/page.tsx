'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { GripVertical, Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order_index: number
  is_active: boolean
  book_count: number
}

interface SortableCategoryProps {
  category: Category
  onDelete: (id: string) => void
}

function SortableCategory({ category, onDelete }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-[16px] p-6 flex items-center gap-4 border border-transparent hover:border-[#e7e6e1] transition-colors"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#b7b7b5] hover:text-[#121212] transition-colors p-1"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Category Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-[14px] font-[500] text-[#121212] truncate">
            {category.name}
          </h3>
          <span className="text-[11px] text-[#7b7974] bg-[#efeeeb] px-2 py-0.5 rounded-[4px]">
            {category.slug}
          </span>
        </div>
        {category.description && (
          <p className="text-[13px] text-[#7b7974] truncate">
            {category.description}
          </p>
        )}
      </div>

      {/* Order Index Badge */}
      <div className="text-[12px] text-[#7b7974] bg-[#efeeeb] px-3 py-1 rounded-[6px] font-[500]">
        Orden: {category.order_index}
      </div>

      {/* Book Count */}
      <div className="text-[12px] text-[#7b7974]">
        {category.book_count} libro{category.book_count !== 1 ? 's' : ''}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/categorias/${category.id}/edit`}
          className="p-2 rounded-[8px] text-[#7b7974] hover:text-[#121212] hover:bg-[#efeeeb] transition-colors"
          aria-label="Editar categoría"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onDelete(category.id)}
          className="p-2 rounded-[8px] text-[#7b7974] hover:text-[#d97757] hover:bg-[#fef3f0] transition-colors"
          aria-label="Eliminar categoría"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Error al cargar categorías')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      
      setCategories(newCategories)

      // Update order_index in database
      const updates = newCategories.map((cat, index) => ({
        id: cat.id,
        order_index: index,
      }))

      try {
        await Promise.all(
          updates.map(({ id, order_index }) =>
            fetch(`/api/categories/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_index }),
            })
          )
        )
      } catch (err) {
        console.error('Error updating order:', err)
        fetchCategories() // Revert on error
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los libros asociados quedarán sin categoría.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setCategories(categories.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#7b7974] text-[14px]">Cargando categorías...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-[16px] p-8 text-center">
        <p className="text-[#7b7974] text-[14px] mb-4">{error}</p>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-[400] text-[#121212] mb-1" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
            Categorías
          </h1>
          <p className="text-[14px] text-[#7b7974]">
            Organiza las categorías del catálogo. Arrastra para reordenar.
          </p>
        </div>
        <Link
          href="/dashboard/categorias/new"
          className="px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors"
        >
          Nueva categoría
        </Link>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-[16px] p-12 text-center">
          <p className="text-[#7b7974] text-[14px] mb-4">
            No hay categorías. Crea la primera para organizar tus libros.
          </p>
          <Link
            href="/dashboard/categorias/new"
            className="inline-block px-4 py-2 bg-[#121212] text-[#f8f8f6] text-[14px] font-[500] rounded-[8px] hover:bg-[#373734] transition-colors"
          >
            Crear categoría
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
