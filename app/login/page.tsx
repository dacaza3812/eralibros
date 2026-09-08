'use client'

import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f8f6] font-[system-ui] flex items-center justify-center px-6">
        <div className="text-[14px] text-[#7b7974]">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
