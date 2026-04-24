'use client'

import { motion } from 'framer-motion'

interface AssistantAvatarProps {
  onClick: () => void
  isOpen: boolean
  isThinking?: boolean
  hasNotification?: boolean
}

export default function AssistantAvatar({
  onClick,
  isOpen,
  isThinking = false,
  hasNotification = false,
}: AssistantAvatarProps) {
  return (
    <div className="fixed z-50 bottom-6 right-6">
      <motion.div
        animate={isOpen ? { y: 0, scale: 1 } : { y: [0, -8, 0], scale: 1 }}
        transition={
          isOpen
            ? { duration: 0.2 }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
        onClick={onClick}
        aria-label="المساعد الذكي"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick()}
        className="relative cursor-pointer select-none"
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-lg"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Avatar circle */}
        <div className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl border-2 border-white transition-all duration-300 ${
          isOpen
            ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
            : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600'
        }`}>
          {isThinking ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
          ) : isOpen ? (
            <span className="text-white font-bold text-lg">✕</span>
          ) : (
            '🤖'
          )}
        </div>

        {/* Notification pulse dot */}
        {hasNotification && !isOpen && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Thinking dots */}
        {isThinking && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-full px-2 py-1 shadow">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
