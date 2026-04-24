'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  /** When set, clicking "تطبيق" fills this text into the target field */
  fillTarget?: { fieldId: string; value: string }
}

export interface AIConversationState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export function useAIConversation(formData: Record<string, any>, currentStep: number) {
  const [state, setState] = useState<AIConversationState>({
    messages: [],
    isLoading: false,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (text: string, promptOverride?: string) => {
      if (!text.trim()) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMsg],
        isLoading: true,
        error: null,
      }))

      // cancel previous in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: promptOverride ?? text,
            context: { formData, currentStep },
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.response?.text ?? data.response ?? 'حدث خطأ غير متوقع.',
          timestamp: new Date(),
          fillTarget: data.response?.fillTarget,
        }

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMsg],
          isLoading: false,
        }))

        return assistantMsg
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'تعذّر الاتصال بالمساعد الذكي. تحقق من اتصالك بالإنترنت.',
        }))
      }
    },
    [formData, currentStep]
  )

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null })
  }, [])

  return { ...state, sendMessage, clearMessages }
}
