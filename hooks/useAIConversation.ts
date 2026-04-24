'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  /** Generated content (e.g. summary body text) separate from the chat reply */
  content?: string
  /** Suggestions from AI (tips, improvements etc.) */
  tips?: string[]
  improvements?: string[]
  /** Skill arrays returned by suggest_skills intent */
  technicalSkills?: string[]
  softSkills?: string[]
  /** When set, clicking "تطبيق" fills this into the target field */
  fillTarget?: { fieldId: string; value: string | string[] }
}

export type AIIntent =
  | 'generate_summary'
  | 'write_responsibilities'
  | 'write_achievements'
  | 'suggest_skills'
  | 'improve_text'
  | 'general_advice'
  | 'guided_generate'
  | 'chat'

export interface SendMessageOptions {
  /** Override the display text shown in chat with a different API prompt */
  promptOverride?: string
  /** Declare the intent explicitly (skips server-side detection) */
  intent?: AIIntent
  /** The field this message targets (used for auto-fill) */
  targetField?: string
  /** Existing content to improve (for improve_text intent) */
  existingContent?: string
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
    async (text: string, options: SendMessageOptions | string = {}) => {
      if (!text.trim()) return

      // Support legacy string signature (promptOverride)
      const opts: SendMessageOptions =
        typeof options === 'string' ? { promptOverride: options } : options

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

      // Cancel previous in-flight request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      // Build conversation history (exclude current user message, keep last 8 turns)
      const historySnapshot = state.messages.slice(-8).map(m => ({
        role: m.role,
        content: m.text,
      }))

      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: opts.promptOverride ?? text,
            intent: opts.intent,
            targetField: opts.targetField,
            existingContent: opts.existingContent,
            history: historySnapshot,
            context: { formData, currentStep },
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const r = data.response ?? {}

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: typeof r === 'string' ? r : (r.text ?? 'حدث خطأ غير متوقع.'),
          timestamp: new Date(),
          content: r.content,
          tips: r.tips,
          improvements: r.improvements,
          technicalSkills: r.technicalSkills,
          softSkills: r.softSkills,
          fillTarget: r.fillTarget,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, currentStep, state.messages]
  )

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null })
  }, [])

  return { ...state, sendMessage, clearMessages }
}
