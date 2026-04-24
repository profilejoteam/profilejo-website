'use client'

import { useEffect, useState, useCallback } from 'react'

export function useScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY
    setScrollDirection(currentY > lastScrollY ? 'down' : 'up')
    setScrollY(currentY)
    setLastScrollY(currentY)
  }, [lastScrollY])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { scrollY, scrollDirection }
}
