'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaUser, FaGraduationCap, FaBriefcase, FaLink, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaUpload, FaCheck } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface BasicFormData {
  // Basic required fields
  fullName: string
  dateOfBirth: string
  city: string
  phone: string
  email: string
  linkedinUrl: string
  
  // Education (minimum 1 required)
  education: Array<{
    degree: string
    major: string
    university: string
    faculty: string
    startDate: string
    graduationDate: string
    isPresent: boolean
    gpa: string
    gpaScale: string
    notes: string
  }>
  
  // Experience (optional but recommended)
  experience: Array<{
    jobTitle: string
    organization: string
    location: string
    startDate: string
    endDate: string
    isPresent: boolean
    responsibilities: string
    employmentType: string
  }>
  
  // Legal consents (required)
  dataUsageConsent: boolean
  marketingConsent: boolean
}

const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${i + 1 <= currentStep ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}
            animate={{ scale: i + 1 === currentStep ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {i + 1}
          </motion.div>
          {i < totalSteps - 1 && (
            <motion.div
              className={`h-1 w-16 mx-2 rounded-full
                ${i + 1 < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i + 1 < currentStep ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      ))}
    </div>
    <p className="text-gray-600 text-center">
      الخطوة {currentStep} من {totalSteps}
    </p>
  </div>
)

// Validation functions
const validateFullName = (name: string): string => {
  if (!name.trim()) return 'الاسم الكامل مطلوب'
  if (name.length < 3) return 'الاسم يجب أن يكون 3 أحرف على الأقل'
  if (name.length > 100) return 'الاسم طويل جداً (100 حرف كحد أقصى)'
  if (/^\d+$/.test(name)) return 'الاسم لا يمكن أن يكون أرقام فقط'
  return ''
}

const validatePhone = (phone: string): string => {
  if (!phone.trim()) return 'رقم الهاتف مطلوب'
  // قبول 10 أرقام فقط بدءاً من 7
  const phoneRegex = /^7[789]\d{7}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'أدخل رقم هاتف صحيح (10 أرقام تبدأ بـ 7، مثال: 0778123456)'
  }
  return ''
}

const validateLinkedIn = (url: string): string => {
  // جعل LinkedIn اختياري
  if (!url.trim()) return '' // لا خطأ إذا كان فارغ
  if (!url.includes('linkedin.com/in/') && !url.includes('linkedin.com/pub/')) {
    return 'أدخل رابط LinkedIn صحيح'
  }
  return ''
}

const PersonalInfoStep = ({ 
  data, 
  onChange, 
  errors 
}: { 
  data: Pick<BasicFormData, 'fullName' | 'dateOfBirth' | 'city' | 'phone' | 'email' | 'linkedinUrl'>
  onChange: (data: Pick<BasicFormData, 'fullName' | 'dateOfBirth' | 'city' | 'phone' | 'email' | 'linkedinUrl'>) => void
  errors: Record<string, string>
}) => {
  const jordanianCities = [
    'عمان', 'إربد', 'الزرقاء', 'الرصيفة', 'وادي السير', 'تلاع العلي', 'السلط', 'المفرق', 
    'عجلون', 'جرش', 'مادبا', 'الكرك', 'الطفيلة', 'معان', 'العقبة'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-2xl text-primary-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">المعلومات الشخصية</h3>
        <p className="text-gray-600">الحقول الأساسية المطلوبة لإرسال الطلب</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            الاسم الكامل *
          </label>
          <input
            type="text"
            className={`w-full p-4 rounded-xl bg-white border ${
              errors.fullName ? 'border-red-500' : 'border-gray-200'
            } text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors`}
            placeholder="أحمد محمد العلي"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">3-100 حرف، بدون أرقام مجردة</p>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">تاريخ الميلاد *</label>
          <input
            type="date"
            className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">المدينة *</label>
          <select
            className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
          >
            <option value="">اختر المدينة</option>
            {jordanianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">رقم الهاتف / واتساب *</label>
          <input
            type="tel"
            className={`w-full p-4 rounded-xl bg-white border ${
              errors.phone ? 'border-red-500' : 'border-gray-200'
            } text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors`}
            placeholder="+962778123456"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            dir="ltr"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني *</label>
          <input
            type="email"
            className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
            placeholder="ahmad@example.com"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">رابط LinkedIn (اختياري)</label>
          <input
            type="url"
            className={`w-full p-4 rounded-xl bg-white border ${
              errors.linkedinUrl ? 'border-red-500' : 'border-gray-200'
            } text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors`}
            placeholder="https://www.linkedin.com/in/ahmad-ali-12345/"
            value={data.linkedinUrl}
            onChange={(e) => onChange({ ...data, linkedinUrl: e.target.value })}
            dir="ltr"
          />
          {errors.linkedinUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>
          )}
          <p className="text-orange-600 text-sm mt-2 flex items-start gap-2">
            <span>⚠️</span>
            وجود بروفايل قوي على LinkedIn يزيد فرصك بشكل كبير في سوق العمل.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function NewFormSection({ onSubmit }: { onSubmit: (data: BasicFormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<BasicFormData>({
    fullName: '',
    dateOfBirth: '',
    city: '',
    phone: '',
    email: '',
    linkedinUrl: '',
    education: [{
      degree: '',
      major: '',
      university: '',
      faculty: '',
      startDate: '',
      graduationDate: '',
      isPresent: false,
      gpa: '',
      gpaScale: '4.0',
      notes: ''
    }],
    experience: [],
    dataUsageConsent: false,
    marketingConsent: false
  })

  const totalSteps = 4

  // Load existing data if available
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (profile) {
            setFormData({
              fullName: profile.full_name || '',
              dateOfBirth: profile.date_of_birth || '',
              city: profile.city || '',
              phone: profile.phone || '',
              email: profile.email || user.email || '',
              linkedinUrl: profile.linkedin_url || '',
              education: profile.education || [{
                degree: '',
                major: '',
                university: '',
                faculty: '',
                startDate: '',
                graduationDate: '',
                isPresent: false,
                gpa: '',
                gpaScale: '4.0',
                notes: ''
              }],
              experience: profile.experience || [],
              dataUsageConsent: profile.data_usage_consent || false,
              marketingConsent: profile.marketing_consent || false
            })
          } else {
            // Set email from auth user if no profile exists
            setFormData(prev => ({ ...prev, email: user.email || '' }))
          }
        }
      } catch (error) {
        console.log('No existing data found or error loading:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExistingData()
  }, [])

  if (loading) {
    return (
      <section className="min-h-screen py-20 px-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </section>
    )
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      // Validate personal info
      const nameError = validateFullName(formData.fullName)
      if (nameError) newErrors.fullName = nameError

      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب'
      if (!formData.city) newErrors.city = 'المدينة مطلوبة'

      const phoneError = validatePhone(formData.phone)
      if (phoneError) newErrors.phone = phoneError

      if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح'

      // LinkedIn اختياري - نتحقق من التنسيق فقط إذا كان مدخل
      if (formData.linkedinUrl.trim()) {
        const linkedinError = validateLinkedIn(formData.linkedinUrl)
        if (linkedinError) newErrors.linkedinUrl = linkedinError
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={{
              fullName: formData.fullName,
              dateOfBirth: formData.dateOfBirth,
              city: formData.city,
              phone: formData.phone,
              email: formData.email,
              linkedinUrl: formData.linkedinUrl
            }}
            onChange={(data) => setFormData({ ...formData, ...data })}
            errors={errors}
          />
        )
      default:
        return <div>Step {currentStep} - Coming soon</div>
    }
  }

  return (
    <section className="min-h-screen py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaArrowLeft /> السابق
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 text-lg font-semibold"
              >
                أرسل طلبك – وابدأ ببناء بروفايلك المهني الآن!
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                التالي <FaArrowRight />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
