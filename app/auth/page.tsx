'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/form')
      }
    }
    checkUser()
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          router.push('/form')
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        
        if (data.user) {
          setError('تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التأكيد قبل تسجيل الدخول.')
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'بيانات تسجيل الدخول غير صحيحة'
          : error.message === 'User already registered'
          ? 'هذا البريد الإلكتروني مسجل بالفعل'
          : 'حدث خطأ، يرجى المحاولة مرة أخرى'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-200 rounded-full opacity-40 blur-2xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">ب</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">بروفايل</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'مرحباً بعودتك! سجل الدخول للمتابعة' : 'انضم إلينا وابدأ رحلتك المهنية'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              البريد الإلكتروني *
            </label>
            <div className="relative">
              <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-12 pl-4 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="your.email@example.com"
                required
                dir="ltr"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              كلمة المرور *
            </label>
            <div className="relative">
              <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-12 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-sm text-gray-500 mt-1">
                يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                جاري المعالجة...
              </div>
            ) : (
              isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
            )}
          </motion.button>
        </form>

        {/* Toggle between login/signup */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-primary-600 hover:text-primary-700 font-medium mr-2 transition-colors"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <a 
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            ← العودة للصفحة الرئيسية
          </a>
        </div>
      </motion.div>
    </div>
  )
}
