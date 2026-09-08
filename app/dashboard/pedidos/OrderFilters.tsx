'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function OrderFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const status = searchParams.get('status') || ''

  function handleSearch(value: string) {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    
    router.push(`/dashboard/pedidos?${params.toString()}`, { scroll: false })
  }

  function handleStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    
    router.push(`/dashboard/pedidos?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-[rgba(0,0,0,0.04)_0px_4px_20px_0px]">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b7b7b5]" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] placeholder-[#b7b7b5] focus:outline-none focus:border-[#121212]/20 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-[200px]">
          <select
            value={status}
            onChange={(e) => handleStatus(e.target.value)}
            className="w-full px-4 py-2 bg-[#f8f8f6] border border-[#e7e6e1] rounded-[8px] text-[14px] text-[#121212] focus:outline-none focus:border-[#121212]/20 transition-colors"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
