'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Briefcase } from 'lucide-react'

interface QuestionSequenceProps {
  onAnswer: (isRecentGraduate: boolean) => void
  visible: boolean
}

export default function QuestionSequence({ onAnswer, visible }: QuestionSequenceProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="question-overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
            dir="rtl"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
              🤖
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              مرحباً! أنا مساعدك الذكي 👋
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              سأساعدك في بناء بروفايل احترافي يناسب سوق العمل.
              <br />
              سؤال واحد سريع:
            </p>

            <p className="text-lg font-semibold text-gray-800 mb-6">
              هل أنت حديث/ة التخرج؟
            </p>

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onAnswer(true)}
                className="flex-1 flex flex-col items-center gap-2 py-4 px-4 bg-gradient-to-b from-green-50 to-green-100 border-2 border-green-300 rounded-2xl hover:border-green-500 transition-all"
              >
                <GraduationCap className="text-green-600" size={28} />
                <span className="font-semibold text-green-700">نعم</span>
                <span className="text-xs text-green-500">حديث/ة التخرج</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onAnswer(false)}
                className="flex-1 flex flex-col items-center gap-2 py-4 px-4 bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl hover:border-blue-500 transition-all"
              >
                <Briefcase className="text-blue-600" size={28} />
                <span className="font-semibold text-blue-700">لا</span>
                <span className="text-xs text-blue-500">لدي خبرة عملية</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
