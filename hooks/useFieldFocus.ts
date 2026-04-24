'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface FieldFocusInfo {
  fieldId: string | null
  fieldLabel: string | null
  fieldType: string | null
  rect: DOMRect | null
  /** pixel distance from top of viewport to centre of the active field */
  topOffset: number
}

/**
 * Tracks which form field is currently focused and where it sits on screen.
 * Fields must have a `data-field-id` attribute and optionally `data-field-label`.
 */
export function useFieldFocus(): FieldFocusInfo {
  const [info, setInfo] = useState<FieldFocusInfo>({
    fieldId: null,
    fieldLabel: null,
    fieldType: null,
    rect: null,
    topOffset: window ? window.innerHeight / 2 : 300,
  })

  const rafRef = useRef<number | null>(null)

  const update = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const centre = rect.top + rect.height / 2
    setInfo({
      fieldId: el.dataset.fieldId ?? el.id ?? null,
      fieldLabel: el.dataset.fieldLabel ?? el.getAttribute('aria-label') ?? null,
      fieldType: el.tagName.toLowerCase() === 'input' ? (el as HTMLInputElement).type : el.tagName.toLowerCase(),
      rect,
      topOffset: Math.max(80, Math.min(centre, window.innerHeight - 80)),
    })
  }, [])

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!el || !('tagName' in el)) return
      const tag = el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => update(el))
      }
    }

    const onBlur = () => {
      // keep the last focused field visible for 2 s so the assistant stays
    }

    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('focusout', onBlur, true)
    return () => {
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('focusout', onBlur, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  // Re-compute rect on scroll/resize without changing fieldId
  useEffect(() => {
    const recompute = () => {
      const active = document.activeElement as HTMLElement | null
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
        update(active)
      }
    }
    window.addEventListener('scroll', recompute, { passive: true })
    window.addEventListener('resize', recompute, { passive: true })
    return () => {
      window.removeEventListener('scroll', recompute)
      window.removeEventListener('resize', recompute)
    }
  }, [update])

  return info
}
