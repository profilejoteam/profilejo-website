'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Loader2, ClipboardCopy } from 'lucide-react'
import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { ChatMessage } from '@/hooks/useAIConversation'

interface ChatPortalProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  onSend: (text: string) => void
  onFillField?: (fieldId: string, value: string) => void
  /** Contextual quick-action prompts shown above the input */
  quickPrompts?: { label: string; prompt: string }[]
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
}: ChatPortalProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when portal opens
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
          className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: '80vh' }}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-l from-blue-600 to-indigo-600 text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🤖
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">المساعد الذكي</p>
              <p className="text-xs opacity-75">مدعوم بـ GPT-4o</p>
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
                اسألني أي شيء عن سيرتك الذاتية وسأساعدك في تحسينها.
              </div>
            )}

            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onFillField={onFillField}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span>يكتب...</span>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {quickPrompts.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-gray-100 shrink-0 bg-white" dir="rtl">
              {quickPrompts.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => onSend(qp.prompt)}
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

/* ── MessageBubble ── */
function MessageBubble({
  msg,
  onFillField,
}: {
  msg: ChatMessage
  onFillField?: (fieldId: string, value: string) => void
}) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(msg.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tl-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tr-sm shadow-sm'
        }`}
      >
        {msg.text}
      </div>

      {!isUser && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={copyText}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            <ClipboardCopy size={12} />
            {copied ? 'تم النسخ' : 'نسخ'}
          </button>

          {msg.fillTarget && onFillField && (
            <button
              onClick={() => onFillField(msg.fillTarget!.fieldId, msg.fillTarget!.value)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
            >
              ✏️ تطبيق في الخانة
            </button>
          )}
        </div>
      )}
    </div>
  )
}
