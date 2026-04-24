'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2, ClipboardCopy, CheckCheck } from 'lucide-react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { ChatMessage } from '@/hooks/useAIConversation'

interface QuickPromptItem {
  label: string
  prompt: string
  intent?: string
  targetField?: string
}

interface ChatPortalProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  onSend: (text: string) => void
  onFillField?: (fieldId: string, value: string | string[]) => void
  quickPrompts?: QuickPromptItem[]
  /** Called with the full quick-prompt item (intent-aware) */
  onQuickPrompt?: (item: QuickPromptItem) => void
}

export default function ChatPortal({
  isOpen,
  onClose,
  messages,
  isLoading,
  error,
  onSend,
  onFillField,
  quickPrompts = [],
  onQuickPrompt,
}: ChatPortalProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-portal"
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: '75vh' }}
          initial={{ opacity: 0, y: 20, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-l from-blue-600 to-indigo-600 text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🤖
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">رافي - المساعد الذكي</p>
              <p className="text-xs opacity-75">مدعوم بـ GPT-4o mini</p>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50" dir="rtl">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-6 leading-relaxed px-2">
                <Sparkles className="mx-auto mb-2 text-blue-400" size={24} />
                <p className="font-medium text-gray-600 mb-1">أهلاً! أنا رافي 👋</p>
                <p>اسألني أن أكتب نبذتك، مسؤولياتك، إنجازاتك أو أقترح لك المهارات.</p>
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onFillField={onFillField} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span>رافي يفكر...</span>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {quickPrompts.length > 0 && (
            <div
              className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-gray-100 shrink-0 bg-white"
              dir="rtl"
              style={{ scrollbarWidth: 'none' }}
            >
              {quickPrompts.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => onQuickPrompt ? onQuickPrompt(qp) : onSend(qp.prompt)}
                  disabled={isLoading}
                  className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 shrink-0 bg-white" dir="rtl">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="اكتب رسالتك..."
              className="flex-1 resize-none rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-28 overflow-y-auto leading-relaxed"
              style={{ direction: 'rtl' }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
              aria-label="إرسال"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* MessageBubble */
function MessageBubble({
  msg,
  onFillField,
}: {
  msg: ChatMessage
  onFillField?: (fieldId: string, value: string | string[]) => void
}) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const [applied, setApplied] = useState(false)

  const textToCopy = msg.content ?? msg.text
  const copyText = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const applyToField = () => {
    if (!msg.fillTarget || !onFillField) return
    onFillField(msg.fillTarget.fieldId, msg.fillTarget.value)
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
      {/* Main bubble */}
      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tl-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tr-sm shadow-sm'
        }`}
      >
        {msg.text}
      </div>

      {/* Generated content preview (shown separately from chat text) */}
      {!isUser && msg.content && (
        <div className="max-w-[88%] mt-1 bg-green-50 border border-green-200 rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </div>
      )}

      {/* Skills suggestion pills */}
      {!isUser && (msg.technicalSkills?.length || msg.softSkills?.length) ? (
        <div className="max-w-[88%] mt-1 space-y-1" dir="rtl">
          {msg.technicalSkills && msg.technicalSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {msg.technicalSkills.map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          )}
          {msg.softSkills && msg.softSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {msg.softSkills.map(s => (
                <span key={s} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Tips list */}
      {!isUser && msg.tips && msg.tips.length > 0 && (
        <ul className="max-w-[88%] mt-1 space-y-0.5" dir="rtl">
          {msg.tips.map((tip, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-1">
              <span className="shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Improvements list */}
      {!isUser && msg.improvements && msg.improvements.length > 0 && (
        <ul className="max-w-[88%] mt-1 space-y-0.5" dir="rtl">
          {msg.improvements.map((imp, i) => (
            <li key={i} className="text-xs text-emerald-700 flex gap-1">
              <span className="shrink-0">✓</span>
              <span>{imp}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Action buttons */}
      {!isUser && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={copyText}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            {copied ? <CheckCheck size={12} className="text-green-500" /> : <ClipboardCopy size={12} />}
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>

          {msg.fillTarget && onFillField && (
            <button
              onClick={applyToField}
              className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                applied ? 'text-green-600' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {applied ? '✅ تم التطبيق' : '✏️ تطبيق في الخانة'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
