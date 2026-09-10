'use client'

import { useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

export interface MotionConfig {
  shouldReduceMotion: boolean
  duration: number
  staggerDelay: number
  threshold: number
}

export function useMotionConfig(staggerDelay: number = 100): MotionConfig {
  const shouldReduceMotion = useReducedMotion() ?? false

  return useMemo(
    () => ({
      shouldReduceMotion,
      duration: 0.5,
      staggerDelay,
      threshold: 0.2,
    }),
    [shouldReduceMotion, staggerDelay]
  )
}
