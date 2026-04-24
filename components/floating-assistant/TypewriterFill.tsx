'use client'

import { useEffect, useRef, useState } from 'react'

interface TypewriterFillProps {
  targetValue: string
  /** Called for each character appended */
  onUpdate: (partial: string) => void
  /** Called when typing is complete */
  onComplete?: () => void
  /** Characters per second (default 40) */
  speed?: number
  /** Whether to start typing immediately */
  active?: boolean
}

/**
 * Invisible component that incrementally calls `onUpdate` to simulate
 * the AI "typing" into a form field character by character.
 */
export default function TypewriterFill({
  targetValue,
  onUpdate,
  onComplete,
  speed = 40,
  active = true,
}: TypewriterFillProps) {
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active || done) return

    indexRef.current = 0

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      onUpdate(targetValue.slice(0, indexRef.current))

      if (indexRef.current >= targetValue.length) {
        clearInterval(intervalRef.current!)
        setDone(true)
        onComplete?.()
      }
    }, 1000 / speed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, active])

  return null
}
