'use client'

import { useState, useCallback, useEffect } from 'react'
import { useFieldFocus } from '@/hooks/useFieldFocus'
import { useAIConversation, type AIIntent } from '@/hooks/useAIConversation'
import { useGuidedFlow } from '@/hooks/useGuidedFlow'
import { findSequence } from '@/components/floating-assistant/field-questions'
import AssistantAvatar from './AssistantAvatar'
import FloatingBubble from './FloatingBubble'
import ChatPortal from './ChatPortal'
import TypewriterFill from './TypewriterFill'
import GuidedFlowModal from './GuidedFlowModal'

// ─── Quick prompts for the free-chat portal ───────────────────────────────────

const QUICK_PROMPTS: Array<{ label: string; prompt: string; intent: AIIntent; targetField?: string }> = [
  {
    label: '✍️ نبذة شخصية',
    prompt: 'اكتب لي نبذة شخصية احترافية',
    intent: 'generate_summary',
    targetField: 'summary',
  },
  {
    label: '📋 مسؤوليات',
    prompt: 'اكتب لي مسؤوليات وظيفية احترافية',
    intent: 'write_responsibilities',
    targetField: 'responsibilities',
  },
  {
    label: '🏆 إنجازات',
    prompt: 'اكتب لي إنجازات مهنية بأسلوب STAR',
    intent: 'write_achievements',
    targetField: 'achievements',
  },
  {
    label: '💡 مهارات',
    prompt: 'اقترح مهارات تقنية وشخصية مناسبة لتخصصي',
    intent: 'suggest_skills',
    targetField: 'technicalSkills',
  },
  {
    label: '💬 نصيحة',
    prompt: 'أعطني نصائح عملية لتحسين فرص توظيفي',
    intent: 'general_advice',
  },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface FloatingAssistantProps {
  formData: Record<string, any>
  currentStep: number
  onFillField?: (fieldId: string, value: string | string[]) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingAssistant({
  formData,
  currentStep,
  onFillField,
}: FloatingAssistantProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [guidedOpen, setGuidedOpen] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState<Record<string, boolean>>({})
  const [typewriterState, setTypewriterState] = useState<{
    fieldId: string
    value: string
    active: boolean
  } | null>(null)

  const fieldFocus = useFieldFocus()
  const { messages, isLoading, error, sendMessage } = useAIConversation(formData, currentStep)
  const guidedFlow = useGuidedFlow()

  /* ── Derive bubble visibility ── */
  const activeFieldId = fieldFocus.fieldId
  const activeSequence = activeFieldId ? findSequence(activeFieldId) : null

  const isBubbleVisible =
    !!activeSequence &&
    !chatOpen &&
    !guidedOpen &&
    !bubbleDismissed[activeFieldId ?? '']

  const topOffset = fieldFocus.topOffset

  /* ── "نعم ✨" — launch guided flow ── */
  const handleBubbleYes = useCallback(() => {
    if (!activeFieldId) return
    const started = guidedFlow.start(activeFieldId)
    if (started) {
      setGuidedOpen(true)
      setBubbleDismissed(prev => ({ ...prev, [activeFieldId]: true }))
    }
  }, [activeFieldId, guidedFlow])

  /* ── "لا شكراً" — dismiss bubble ── */
  const handleBubbleDecline = useCallback(() => {
    if (!activeFieldId) return
    setBubbleDismissed(prev => ({ ...prev, [activeFieldId]: true }))
  }, [activeFieldId])

  /* ── Apply generated content to field ── */
  const handleGuidedApply = useCallback(
    (fieldId: string, content: string) => {
      // String content — run through typewriter for visual effect
      setTypewriterState({ fieldId, value: content, active: true })
    },
    []
  )

  /* ── Close guided modal and reset flow ── */
  const handleGuidedClose = useCallback(() => {
    setGuidedOpen(false)
    guidedFlow.reset()
  }, [guidedFlow])

  /* ── Fill field from ChatPortal (arrays direct, strings via typewriter) ── */
  const handleFillField = useCallback(
    (fieldId: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        onFillField?.(fieldId, value)
      } else {
        setTypewriterState({ fieldId, value, active: true })
      }
    },
    [onFillField]
  )

  /* ── Typewriter progress → propagate to form ── */
  const handleTypewriterUpdate = useCallback(
    (partial: string) => {
      if (!typewriterState) return
      onFillField?.(typewriterState.fieldId, partial)
    },
    [typewriterState, onFillField]
  )

  /* ── Quick prompts from ChatPortal ── */
  const handleQuickPrompt = useCallback(
    (item: { label: string; prompt: string; intent?: string; targetField?: string }) => {
      sendMessage(item.prompt, {
        intent: (item.intent as AIIntent) ?? 'chat',
        targetField: item.targetField,
      })
    },
    [sendMessage]
  )

  /* ── Reset dismissed state on step change ── */
  useEffect(() => {
    setBubbleDismissed({})
    guidedFlow.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  return (
    <>
      {/* Invisible typewriter side-effect */}
      {typewriterState?.active && (
        <TypewriterFill
          targetValue={typewriterState.value}
          onUpdate={handleTypewriterUpdate}
          onComplete={() => setTypewriterState(null)}
          speed={30}
        />
      )}

      {/* Contextual bubble — shows "نعم / لا" */}
      <FloatingBubble
        message={activeSequence?.intro ?? ''}
        emoji={activeSequence?.emoji}
        visible={isBubbleVisible}
        hasGuidedFlow
        onDismiss={handleBubbleDecline}
        onDecline={handleBubbleDecline}
        onAction={handleBubbleYes}
      />

      {/* Floating robot avatar — fixed bottom-right */}
      <AssistantAvatar
        isOpen={chatOpen}
        isThinking={isLoading || guidedFlow.state.isLoading}
        hasNotification={isBubbleVisible}
        onClick={() => setChatOpen(prev => !prev)}
      />

      {/* Free-conversation chat portal */}
      <ChatPortal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={text => sendMessage(text)}
        onFillField={handleFillField}
        quickPrompts={QUICK_PROMPTS}
        onQuickPrompt={handleQuickPrompt}
      />

      {/* ★ Guided question-flow modal */}
      <GuidedFlowModal
        isOpen={guidedOpen}
        flow={guidedFlow}
        formData={formData}
        currentStep={currentStep}
        onApply={handleGuidedApply}
        onClose={handleGuidedClose}
      />
    </>
  )
}
