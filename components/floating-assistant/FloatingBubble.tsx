'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface FloatingBubbleProps {
  message: string
  emoji?: string
  visible: boolean
  onDismiss: () => void
  onAction?: () => void
  actionLabel?: string
  topOffset: number
}

export default function FloatingBubble({
  message,
  emoji = '💡',
  visible,
  onDismiss,
  onAction,
  actionLabel = 'ساعدني',
  topOffset,
}: FloatingBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="bubble"
          className="fixed z-40 max-w-xs"
          style={{ right: 88 }}
          animate={{ top: topOffset - 24 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          initial={{ opacity: 0, x: 20, scale: 0.85 }}
          exit={{ opacity: 0, x: 20, scale: 0.85 }}
        >
          <div
            className="relative bg-white border border-blue-100 shadow-xl rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-700 leading-relaxed"
            dir="rtl"
          >
            {/* Tail pointing right toward avatar */}
            <span className="absolute -right-2 top-3 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white" />

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="absolute top-1.5 left-1.5 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="إغلاق"
            >
              <X size={14} />
            </button>

            <p className="pr-1 pt-0.5">
              <span className="mr-1">{emoji}</span>
              {message}
            </p>

            {onAction && (
              <button
                onClick={onAction}
                className="mt-2 w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
