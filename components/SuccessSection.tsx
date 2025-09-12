'use client'

import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { FaCheckCircle } from 'react-icons/fa'

export default function SuccessSection() {
  useEffect(() => {
    // Dynamically import confetti to avoid SSR issues
    const loadConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Additional confetti bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
      }, 250)

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 500)
    }

    loadConfetti()
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="container mx-auto max-w-2xl text-center">
        <motion.div
          className="glass-card"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring', bounce: 0.6 }}
            className="mb-8"
          >
            <FaCheckCircle className="text-8xl text-green-400 mx-auto mb-6" />
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            تم إرسال طلبك بنجاح! 🎉
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-xl text-white/80 mb-8 leading-relaxed"
          >
            شكراً لك! تم استلام معلوماتك وسنقوم بالتواصل معك قريباً لبناء بروفايلك المهني.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">ما الخطوة التالية؟</h3>
              <ul className="text-white/80 space-y-2 text-right">
                <li>• سنراجع معلوماتك خلال 24-48 ساعة</li>
                <li>• سنتواصل معك عبر الواتساب أو الإيميل</li>
                <li>• سنبدأ في تصميم بروفايلك المهني</li>
                <li>• ستحصل على النسخة النهائية خلال أسبوع</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              العودة للصفحة الرئيسية
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
