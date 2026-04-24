'use client'

import { useReducer, useCallback, useRef } from 'react'
import {
  findSequence,
  type FieldQuestionSequence,
} from '@/components/floating-assistant/field-questions'
import type { AIIntent } from '@/hooks/useAIConversation'

// ─── State ───────────────────────────────────────────────────────────────────

export type FlowStatus = 'idle' | 'asking' | 'generating' | 'preview' | 'editing'

export interface GuidedFlowState {
  status: FlowStatus
  /** Full field id — e.g. "experience.0.responsibilities" */
  fieldId: string | null
  /** Base field id resolved from the sequence — e.g. "responsibilities" */
  baseFieldId: string | null
  sequence: FieldQuestionSequence | null
  currentQ: number
  answers: Record<string, string>
  generatedContent: string | null
  /** The intent declared by the matched sequence */
  intent: AIIntent | 'guided_generate' | null
  isLoading: boolean
  error: string | null
}

const INITIAL_STATE: GuidedFlowState = {
  status: 'idle',
  fieldId: null,
  baseFieldId: null,
  sequence: null,
  currentQ: 0,
  answers: {},
  generatedContent: null,
  intent: null,
  isLoading: false,
  error: null,
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START'; fieldId: string; sequence: FieldQuestionSequence }
  | { type: 'ANSWER'; qId: string; value: string }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GENERATING' }
  | { type: 'GENERATED'; content: string }
  | { type: 'EDIT' }
  | { type: 'UPDATE_EDIT'; content: string }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

function reducer(state: GuidedFlowState, action: Action): GuidedFlowState {
  switch (action.type) {
    case 'START':
      return {
        ...INITIAL_STATE,
        status: 'asking',
        fieldId: action.fieldId,
        baseFieldId: action.sequence.baseFieldId,
        sequence: action.sequence,
        intent: action.sequence.intent,
        currentQ: 0,
        answers: {},
      }

    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.qId]: action.value },
      }

    case 'NEXT': {
      const totalQ = state.sequence?.questions.length ?? 0
      if (state.currentQ < totalQ - 1) {
        return { ...state, currentQ: state.currentQ + 1 }
      }
      // Last question answered → move to generating
      return { ...state, status: 'generating', isLoading: true, error: null }
    }

    case 'PREV':
      return {
        ...state,
        currentQ: Math.max(0, state.currentQ - 1),
      }

    case 'GENERATING':
      return { ...state, status: 'generating', isLoading: true, error: null }

    case 'GENERATED':
      return {
        ...state,
        status: 'preview',
        isLoading: false,
        generatedContent: action.content,
        error: null,
      }

    case 'EDIT':
      return { ...state, status: 'editing' }

    case 'UPDATE_EDIT':
      return { ...state, generatedContent: action.content }

    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.message,
        status: state.status === 'generating' ? 'asking' : state.status,
      }

    case 'RESET':
      return { ...INITIAL_STATE }

    default:
      return state
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseGuidedFlowReturn {
  state: GuidedFlowState
  /** Begin a guided flow for the given field id */
  start: (fieldId: string) => boolean
  /** Set the answer for a question id */
  answer: (qId: string, value: string) => void
  /** Advance to next question (or trigger generation on last question) */
  next: (formData: Record<string, any>, currentStep: number) => void
  /** Go back one question */
  prev: () => void
  /** Jump straight to generation (skip remaining questions) */
  generate: (formData: Record<string, any>, currentStep: number) => void
  /** Re-generate with the same answers */
  regenerate: (formData: Record<string, any>, currentStep: number) => void
  /** Switch to edit mode */
  enterEdit: () => void
  /** Update the editable content */
  updateEdit: (content: string) => void
  /** Reset to idle */
  reset: () => void
  /** Whether the sequence for a given fieldId exists */
  hasSequence: (fieldId: string) => boolean
}

export function useGuidedFlow(): UseGuidedFlowReturn {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const abortRef = useRef<AbortController | null>(null)

  const hasSequence = useCallback((fieldId: string): boolean => {
    return findSequence(fieldId) !== null
  }, [])

  const start = useCallback((fieldId: string): boolean => {
    const seq = findSequence(fieldId)
    if (!seq) return false
    dispatch({ type: 'START', fieldId, sequence: seq })
    return true
  }, [])

  const answer = useCallback((qId: string, value: string) => {
    dispatch({ type: 'ANSWER', qId, value })
  }, [])

  const callAPI = useCallback(
    async (
      answers: Record<string, string>,
      fieldId: string | null,
      intent: AIIntent | 'guided_generate' | null,
      formData: Record<string, any>,
      currentStep: number
    ) => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      dispatch({ type: 'GENERATING' })

      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: buildPromptMessage(answers, fieldId),
            intent,
            targetField: fieldId,
            guidedAnswers: answers,
            context: { formData, currentStep },
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const r = data.response ?? {}
        const content =
          typeof r === 'string' ? r : (r.content ?? r.text ?? 'لم يتم توليد محتوى.')

        dispatch({ type: 'GENERATED', content })
      } catch (err: any) {
        if (err.name === 'AbortError') return
        dispatch({ type: 'ERROR', message: 'تعذّر الاتصال بالمساعد. تحقق من اتصالك بالإنترنت.' })
      }
    },
    []
  )

  const next = useCallback(
    (formData: Record<string, any>, currentStep: number) => {
      const questions = state.sequence?.questions ?? []
      const isLast = state.currentQ >= questions.length - 1

      if (isLast) {
        // Trigger generation
        callAPI(state.answers, state.fieldId, state.intent, formData, currentStep)
      } else {
        dispatch({ type: 'NEXT' })
      }
    },
    [state, callAPI]
  )

  const prev = useCallback(() => {
    dispatch({ type: 'PREV' })
  }, [])

  const generate = useCallback(
    (formData: Record<string, any>, currentStep: number) => {
      callAPI(state.answers, state.fieldId, state.intent, formData, currentStep)
    },
    [state.answers, state.fieldId, state.intent, callAPI]
  )

  const regenerate = useCallback(
    (formData: Record<string, any>, currentStep: number) => {
      callAPI(state.answers, state.fieldId, state.intent, formData, currentStep)
    },
    [state.answers, state.fieldId, state.intent, callAPI]
  )

  const enterEdit = useCallback(() => {
    dispatch({ type: 'EDIT' })
  }, [])

  const updateEdit = useCallback((content: string) => {
    dispatch({ type: 'UPDATE_EDIT', content })
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'RESET' })
  }, [])

  return {
    state,
    start,
    answer,
    next,
    prev,
    generate,
    regenerate,
    enterEdit,
    updateEdit,
    reset,
    hasSequence,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPromptMessage(
  answers: Record<string, string>,
  fieldId: string | null
): string {
  const lines = Object.entries(answers)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')

  return `بناءً على إجابات المستخدم التالية، قم بتوليد محتوى احترافي للحقل "${fieldId}":\n\n${lines}`
}
