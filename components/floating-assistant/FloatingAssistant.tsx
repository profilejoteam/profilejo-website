'use client'

import { useState, useCallback, useEffect } from 'react'
import { useFieldFocus } from '@/hooks/useFieldFocus'
import { useAIConversation } from '@/hooks/useAIConversation'
import AssistantAvatar from './AssistantAvatar'
import FloatingBubble from './FloatingBubble'
import ChatPortal from './ChatPortal'
import TypewriterFill from './TypewriterFill'

/* ── Per-field tips ── */
const FIELD_TIPS: Record<string, { message: string; emoji: string; prompt: string }> = {
  summary: {
    message: 'أريد مساعدتك في كتابة نبذة شخصية احترافية!',
    emoji: '✍️',
    prompt: 'اكتب لي نبذة شخصية احترافية',
  },
  responsibilities: {
    message: 'يمكنني صياغة مسؤولياتك بأسلوب مهني مؤثر.',
    emoji: '📋',
    prompt: 'ساعدني في كتابة المسؤوليات الوظيفية',
  },
  achievements: {
    message: 'دعني أساعدك في إبراز إنجازاتك بأرقام ملموسة.',
    emoji: '🏆',
    prompt: 'ساعدني في كتابة الإنجازات بأسلوب احترافي',
  },
  technicalSkills: {
    message: 'أقترح لك قائمة مهارات تقنية تناسب تخصصك.',
    emoji: '💻',
    prompt: 'اقترح مهارات تقنية مناسبة لتخصصي',
  },
}

const QUICK_PROMPTS = [
  { label: '📝 نبذة شخصية', prompt: 'اكتب لي نبذة شخصية احترافية بناءً على بياناتي' },
  { label: '💼 مسؤوليات', prompt: 'ساعدني في صياغة المسؤوليات الوظيفية' },
  { label: '🏆 إنجازات', prompt: 'كيف أكتب إنجازاتي بأسلوب مميز؟' },
  { label: '💡 مهارات', prompt: 'ما المهارات الأكثر طلباً في مجالي؟' },
]

interface FloatingAssistantProps {
  formData: Record<string, any>
  currentStep: number
  /** Called when the AI wants to fill a specific field */
  onFillField?: (fieldId: string, value: string) => void
}

export default function FloatingAssistant({
  formData,
  currentStep,
  onFillField,
}: FloatingAssistantProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState<Record<string, boolean>>({})
  const [typewriterState, setTypewriterState] = useState<{
    fieldId: string
    value: string
    active: boolean
  } | null>(null)

  const fieldFocus = useFieldFocus()
  const { messages, isLoading, error, sendMessage } = useAIConversation(formData, currentStep)

  /* Determine the tip for the active field */
  const activeTip =
    fieldFocus.fieldId && FIELD_TIPS[fieldFocus.fieldId]
      ? FIELD_TIPS[fieldFocus.fieldId]
      : null

  const isBubbleVisible =
    !!activeTip &&
    !chatOpen &&
    !bubbleDismissed[fieldFocus.fieldId ?? '']

  const topOffset = fieldFocus.topOffset

  /* Open chat and send contextual prompt for the current field */
  const handleBubbleAction = useCallback(() => {
    if (!activeTip) return
    setChatOpen(true)
    setBubbleDismissed(prev => ({ ...prev, [fieldFocus.fieldId ?? '']: true }))
    sendMessage(activeTip.prompt)
  }, [activeTip, fieldFocus.fieldId, sendMessage])

  /* Fill field via typewriter effect */
  const handleFillField = useCallback(
    (fieldId: string, value: string) => {
      setTypewriterState({ fieldId, value, active: true })
    },
    []
  )

  /* When typewriter updates, propagate to parent */
  const handleTypewriterUpdate = useCallback(
    (partial: string) => {
      if (!typewriterState) return
      onFillField?.(typewriterState.fieldId, partial)
    },
    [typewriterState, onFillField]
  )

  /* Reset bubble dismissed state on step change */
  useEffect(() => {
    setBubbleDismissed({})
  }, [currentStep])

  return (
    <>
      {/* Typewriter fill (invisible side-effect component) */}
      {typewriterState?.active && (
        <TypewriterFill
          targetValue={typewriterState.value}
          onUpdate={handleTypewriterUpdate}
          onComplete={() => setTypewriterState(null)}
          speed={35}
        />
      )}

      {/* Floating tip bubble */}
      <FloatingBubble
        message={activeTip?.message ?? ''}
        emoji={activeTip?.emoji}
        visible={isBubbleVisible}
        topOffset={topOffset}
        onDismiss={() =>
          setBubbleDismissed(prev => ({
            ...prev,
            [fieldFocus.fieldId ?? '']: true,
          }))
        }
        onAction={handleBubbleAction}
        actionLabel="ساعدني ✨"
      />

      {/* Floating avatar */}
      <AssistantAvatar
        topOffset={topOffset}
        isOpen={chatOpen}
        isThinking={isLoading}
        hasNotification={isBubbleVisible}
        onClick={() => setChatOpen(prev => !prev)}
      />

      {/* Full chat portal */}
      <ChatPortal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={sendMessage}
        onFillField={handleFillField}
        quickPrompts={QUICK_PROMPTS}
      />
    </>
  )
}
