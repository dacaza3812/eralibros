'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
}

interface BookFiltersProps {
  categories: Category[] | null
}

export function BookFilters({ categories }: BookFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      router.push(`/dashboard/libros?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, category, router])

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
      <div className="flex gap-4">
        {/* Search */}
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-[14px] font-[500] text-[#373734] mb-1.5">
            Buscar título
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7b7974]" />
            <input
              type="text"
              id="search"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] placeholder:text-[#9c9a92] focus:outline-none focus:ring-2 focus:ring-[#121212]/10"
              placeholder="Buscar por título..."
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="w-[240px]">
          <label
            htmlFor="category"
            className="block text-[14px] font-[500] text-[#373734] mb-1.5">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#f8f8f6] border border-[#b7b7b5] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#121212]/10">
            <option value="">Todas</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters button */}
        {(search || category) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('')
              }}
              className="px-5 py-2 bg-[#b7b7b5] text-[#121212] text-[14px] font-[500] rounded-[8px] hover:bg-[#b7b7b5]/80 transition-colors">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
