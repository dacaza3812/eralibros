'use client'

import { Trash2 } from 'lucide-react'

interface DeleteBookButtonProps {
  bookSlug: string
  bookTitle: string
}

export function DeleteBookButton({ bookSlug, bookTitle }: DeleteBookButtonProps) {
  return (
    <form action={`/dashboard/libros/${bookSlug}/delete`} method="POST">
      <button
        type="submit"
        className="p-1.5 rounded-[6px] text-[#7b7974] hover:bg-[#d97757]/10 hover:text-[#d97757] transition-colors"
        title="Eliminar"
        onClick={(e) => {
          if (!confirm(`¿Estás seguro de eliminar "${bookTitle}"?`)) {
            e.preventDefault()
          }
        }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}
