'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-[system-ui] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[#121212] flex items-center justify-center">
              <span className="text-[#f8f8f6] text-[20px] font-[500]">ℰ</span>
            </div>
          </Link>
          <h1 className="text-[32px] font-[400] text-[#121212] mb-2">
            Iniciar sesión
          </h1>
          <p className="text-[14px] font-[400] text-[#7b7974]">
            Accedé al panel de administración
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-[16px] p-8 space-y-6">
          {error && (
            <div className="bg-[#d97757]/10 border border-[#d97757] rounded-[8px] p-4">
              <p className="text-[14px] font-[400] text-[#d97757]">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[14px] font-[500] text-[#373734] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#f8f8f6] rounded-[8px] border border-[#121212]/10 text-[14px] font-[400] text-[#373734] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#121212] transition-colors"
              placeholder="admin@eralibros.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[14px] font-[500] text-[#373734] mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#f8f8f6] rounded-[8px] border border-[#121212]/10 text-[14px] font-[400] text-[#373734] placeholder:text-[#9c9a92] focus:outline-none focus:border-[#121212] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#121212] text-[#f8f8f6] rounded-[8px] text-[14px] font-[500] hover:bg-[#373734] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center mt-6 text-[13px] font-[400] text-[#7b7974]">
          ¿Problemas para acceder?{' '}
          <Link href="/" className="text-[#d97757] hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
