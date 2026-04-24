'use client'

import { useEffect, useRef, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, CheckCircle, PenLine, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import type { UseGuidedFlowReturn } from '@/hooks/useGuidedFlow'

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuidedFlowModalProps {
  isOpen: boolean
  flow: UseGuidedFlowReturn
  formData: Record<string, any>
  currentStep: number
  /** Called when the user applies the generated content to the field */
  onApply: (fieldId: string, content: string) => void
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuidedFlowModal({
  isOpen,
  flow,
  formData,
  currentStep,
  onApply,
  onClose,
}: GuidedFlowModalProps) {
  const { state, answer, next, prev, regenerate, enterEdit, updateEdit } = flow

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || state.status === 'idle') return null

  const { sequence, currentQ, answers, generatedContent, isLoading, error, status, fieldId } = state
  const questions = sequence?.questions ?? []
  const question = questions[currentQ]
  const totalQ = questions.length
  const progress = totalQ > 0 ? ((currentQ) / totalQ) * 100 : 0

  const handleApply = () => {
    if (fieldId && generatedContent) {
      onApply(fieldId, generatedContent)
      onClose()
    }
  }

  const handleNext = () => {
    next(formData, currentStep)
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-l from-blue-600 to-indigo-600 text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">
                  {sequence?.emoji ?? '🤖'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{sequence?.title ?? 'رافي — المساعد الذكي'}</p>
                  {status === 'asking' && (
                    <p className="text-xs opacity-75">سؤال {currentQ + 1} من {totalQ}</p>
                  )}
                  {status === 'generating' && (
                    <p className="text-xs opacity-75">جار التوليد...</p>
                  )}
                  {(status === 'preview' || status === 'editing') && (
                    <p className="text-xs opacity-75">المحتوى جاهز ✅</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ── Progress bar (only in asking) ── */}
              {status === 'asking' && (
                <div className="h-1 bg-blue-100">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'tween', duration: 0.3 }}
                  />
                </div>
              )}

              {/* ── Body ── */}
              <AnimatePresence mode="wait">

                {/* ── ASK state ── */}
                {status === 'asking' && question && (
                  <motion.div
                    key={`q-${currentQ}`}
                    className="p-6 space-y-5"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.22 }}
                  >
                    {/* Question text */}
                    <div dir="rtl">
                      <p className="text-gray-900 font-semibold text-lg leading-relaxed">
                        {question.text}
                        {question.optional && (
                          <span className="mr-2 text-xs font-normal text-gray-400">(اختياري)</span>
                        )}
                      </p>
                      {question.hint && (
                        <p className="mt-1 text-sm text-gray-400 leading-relaxed">{question.hint}</p>
                      )}
                    </div>

                    {/* Input */}
                    {question.type === 'choice' ? (
                      <div className="grid grid-cols-2 gap-2" dir="rtl">
                        {question.choices?.map(choice => {
                          const selected = answers[question.id] === choice
                          return (
                            <button
                              key={choice}
                              onClick={() => answer(question.id, choice)}
                              className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-right transition-all ${
                                selected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              {choice}
                            </button>
                          )
                        })}
                      </div>
                    ) : question.type === 'textarea' ? (
                      <textarea
                        dir="rtl"
                        rows={3}
                        placeholder={question.placeholder}
                        value={answers[question.id] ?? ''}
                        onChange={e => answer(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 leading-relaxed resize-none"
                      />
                    ) : (
                      <input
                        dir="rtl"
                        type="text"
                        placeholder={question.placeholder}
                        value={answers[question.id] ?? ''}
                        onChange={e => answer(question.id, e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') handleNext()
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    )}

                    {/* Error */}
                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* Footer buttons */}
                    <div className="flex items-center justify-between pt-1" dir="rtl">
                      {currentQ > 0 ? (
                        <button
                          onClick={prev}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <ChevronRight size={16} />
                          السابق
                        </button>
                      ) : <span />}

                      <div className="flex items-center gap-3">
                        {question.optional && (
                          <button
                            onClick={handleNext}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            تخطى
                          </button>
                        )}
                        <button
                          onClick={handleNext}
                          disabled={
                            !question.optional &&
                            !(answers[question.id]?.trim())
                          }
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          {currentQ < totalQ - 1 ? 'التالي' : 'توليد ✨'}
                          <ChevronLeft size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── GENERATING state ── */}
                {status === 'generating' && (
                  <motion.div
                    key="generating"
                    className="flex flex-col items-center justify-center py-16 px-6 gap-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
                        🤖
                      </div>
                      <Loader2
                        size={22}
                        className="absolute -bottom-1 -right-1 text-blue-500 animate-spin"
                      />
                    </div>
                    <div className="text-center" dir="rtl">
                      <p className="text-gray-800 font-semibold text-lg mb-1">رافي يكتب لك...</p>
                      <p className="text-gray-400 text-sm">يُحلّل إجاباتك ويصوغ المحتوى الأمثل</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-blue-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── PREVIEW state ── */}
                {status === 'preview' && generatedContent && (
                  <motion.div
                    key="preview"
                    className="p-6 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    dir="rtl"
                  >
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <p className="font-semibold">هذا ما كتبه رافي لك ✨</p>
                    </div>

                    {/* Generated content */}
                    <div className="bg-gradient-to-b from-green-50 to-emerald-50 border border-green-200 rounded-2xl px-4 py-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                      {generatedContent}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={handleApply}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        تطبيق في الحقل
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => regenerate(formData, currentStep)}
                          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw size={15} />
                          تجديد
                        </button>
                        <button
                          onClick={enterEdit}
                          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PenLine size={15} />
                          تعديل يدوي
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── EDITING state ── */}
                {status === 'editing' && (
                  <motion.div
                    key="editing"
                    className="p-6 space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    dir="rtl"
                  >
                    <p className="text-sm text-gray-500">عدّل النص حسب رغبتك، ثم طبّقه في الحقل:</p>
                    <textarea
                      dir="rtl"
                      rows={7}
                      value={generatedContent ?? ''}
                      onChange={e => updateEdit(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 leading-relaxed resize-none"
                    />
                    <button
                      onClick={handleApply}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      حفظ وتطبيق
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Render via portal to avoid z-index stacking issues
  if (typeof window === 'undefined') return null
  return createPortal(content, document.body)
}
