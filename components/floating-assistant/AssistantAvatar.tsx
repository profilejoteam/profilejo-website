'use client'

import { motion } from 'framer-motion'

interface AssistantAvatarProps {
  onClick: () => void
  /** Whether the chat portal is open */
  isOpen: boolean
  /** Whether the AI is thinking */
  isThinking?: boolean
  /** Whether to show a pulse dot (new message/tip) */
  hasNotification?: boolean
  topOffset: number
}

export default function AssistantAvatar({
  onClick,
  isOpen,
  isThinking = false,
  hasNotification = false,
  topOffset,
}: AssistantAvatarProps) {
  return (
    <motion.div
      className="fixed z-50 cursor-pointer select-none"
      style={{ right: 24 }}
      animate={{ top: topOffset - 28 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {/* Floating idle animation wrapper */}
      <motion.div
        animate={isOpen ? { y: 0 } : { y: [0, -12, 0] }}
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
        className="relative"
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-md"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Avatar circle */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-2xl border-2 border-white">
          {isThinking ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              ⚙️
            </motion.span>
          ) : (
            '🤖'
          )}
        </div>

        {/* Notification dot */}
        {hasNotification && !isOpen && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Thinking dots */}
        {isThinking && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
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
    </motion.div>
  )
}
