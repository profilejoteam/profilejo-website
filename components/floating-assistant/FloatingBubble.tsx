'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

interface FloatingBubbleProps {
  message: string
  emoji?: string
  visible: boolean
  onDismiss: () => void
  onAction?: () => void
  onDecline?: () => void
  hasGuidedFlow?: boolean
  topOffset?: number
}

export default function FloatingBubble({
  message,
  emoji = '💡',
  visible,
  onDismiss,
  onAction,
  onDecline,
  hasGuidedFlow = false,
}: FloatingBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bubble"
          className="fixed z-40 bottom-24 right-6 w-72"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div
            className="relative bg-white border border-blue-100 shadow-2xl rounded-2xl p-4 text-sm text-gray-700"
            dir="rtl"
          >
            {/* Tail pointing DOWN toward avatar */}
            <span className="absolute -bottom-2 right-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow" />

            {/* Dismiss X */}
            <button
              onClick={onDismiss}
              className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="إغلاق"
            >
              <X size={12} />
            </button>

            {/* Header with emoji */}
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
              <p className="leading-snug text-gray-800 font-medium">{message}</p>
            </div>

            {onAction && (
              hasGuidedFlow ? (
                <div className="flex gap-2">
                  <button
                    onClick={onAction}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Sparkles size={13} />
                    نعم، ساعدني!
                  </button>
                  <button
                    onClick={onDecline ?? onDismiss}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium py-2.5 rounded-xl transition-colors"
                  >
                    لا شكراً
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAction}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  <Sparkles size={13} />
                  ساعدني ✨
                </button>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
