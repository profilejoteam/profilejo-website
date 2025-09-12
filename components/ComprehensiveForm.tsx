'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaUser, FaGraduationCap, FaBriefcase, FaLink, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaUpload, FaCheck, FaProjectDiagram, FaCogs, FaLanguage, FaCertificate, FaCamera } from 'react-icons/fa'

interface ComprehensiveFormData {
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
    diplomaFile?: File
  }>
  
  // Experience (repeatable)
  experience: Array<{
    jobTitle: string
    organization: string
    location: string
    startDate: string
    endDate: string
    isPresent: boolean
    responsibilities: string
    achievements: string
    employmentType: string
    referenceName: string
    referenceContact: string
    proofFile?: File
  }>

  // Projects (repeatable)
  projects: Array<{
    title: string
    description: string
    role: string
    startDate: string
    endDate: string
    technologies: string[]
    demoLink: string
    repositoryUrl: string
    isPublic: boolean
    files: File[]
  }>

  // Skills
  skills: Array<{
    name: string
    proficiency: string
    yearsOfExperience: number
  }>

  // Languages
  languages: Array<{
    language: string
    proficiency: string
  }>

  // Certifications
  certifications: Array<{
    title: string
    issuer: string
    issueDate: string
    expiryDate: string
    credentialId: string
    credentialUrl: string
    certificateFile?: File
  }>

  // Job preferences
  preferredRoles: string[]
  preferredIndustries: string[]
  availabilityDate: string
  desiredJobType: string
  willingToRelocate: boolean
  expectedSalaryRange: string
  remoteOk: boolean

  // Files
  portfolioFiles: File[]
  photo?: File

  // Legal consents
  dataUsageConsent: boolean
  marketingConsent: boolean
}

interface ComprehensiveFormProps {
  onSubmit: (data: ComprehensiveFormData) => void
}

const jordanianCities = [
  'عمان', 'إربد', 'الزرقاء', 'الرصيفة', 'وادي السير', 'الطفيلة', 'عجلون', 'مادبا', 
  'الكرك', 'معان', 'جرش', 'السلط', 'العقبة', 'المفرق'
]

const jordanianUniversities = [
  'الجامعة الأردنية', 'جامعة العلوم والتكنولوجيا الأردنية', 'الجامعة الهاشمية', 
  'جامعة اليرموك', 'جامعة مؤتة', 'الجامعة الأردنية الألمانية', 'جامعة عمان الأهلية',
  'الجامعة الأمريكية في مادبا', 'جامعة الشرق الأوسط', 'جامعة الزيتونة الأردنية',
  'جامعة البترا', 'الجامعة التطبيقية', 'أخرى'
]

const degrees = [
  'High School', 'Diploma', 'Associate', 'Bachelor', 'Master', 'PhD'
]

const employmentTypes = [
  'Internship', 'Part-time', 'Full-time', 'Freelance', 'Volunteer'
]

const skillProficiencies = [
  'Beginner', 'Intermediate', 'Advanced', 'Expert'
]

const languageProficiencies = [
  'Basic', 'Conversational', 'Fluent', 'Native'
]

const jobTypes = [
  'Full-time', 'Part-time', 'Internship', 'Remote', 'Hybrid'
]

export default function ComprehensiveForm({ onSubmit }: ComprehensiveFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ComprehensiveFormData>({
    fullName: '',
    dateOfBirth: '',
    city: '',
    phone: '',
    email: '',
    linkedinUrl: '',
    education: [{ 
      degree: '', major: '', university: '', faculty: '', 
      startDate: '', graduationDate: '', isPresent: false, 
      gpa: '', gpaScale: '4.0', notes: '' 
    }],
    experience: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: [],
    preferredRoles: [],
    preferredIndustries: [],
    availabilityDate: '',
    desiredJobType: '',
    willingToRelocate: false,
    expectedSalaryRange: '',
    remoteOk: false,
    portfolioFiles: [],
    dataUsageConsent: false,
    marketingConsent: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const totalSteps = 8

  const stepTitles = [
    'المعلومات الأساسية',
    'التعليم',
    'الخبرات العملية',
    'المشاريع',
    'المهارات',
    'اللغات والشهادات',
    'تفضيلات العمل',
    'الملفات والموافقات'
  ]

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
    const phoneRegex = /^(\+962|0)?7[789]\d{7}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'أدخل رقم هاتف صحيح (مثال: +962778123456)'
    }
    return ''
  }

  const validateLinkedIn = (url: string): string => {
    if (!url.trim()) return 'رابط LinkedIn مطلوب'
    if (!url.includes('linkedin.com/in/') && !url.includes('linkedin.com/pub/')) {
      return 'أدخل رابط LinkedIn صحيح'
    }
    return ''
  }

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'البريد الإلكتروني مطلوب'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'أدخل بريد إلكتروني صحيح'
    }
    return ''
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        newErrors.fullName = validateFullName(formData.fullName)
        newErrors.email = validateEmail(formData.email)
        newErrors.phone = validatePhone(formData.phone)
        newErrors.linkedinUrl = validateLinkedIn(formData.linkedinUrl)
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب'
        if (!formData.city) newErrors.city = 'المدينة مطلوبة'
        break
      
      case 2:
        if (formData.education.length === 0) {
          newErrors.education = 'يجب إضافة درجة علمية واحدة على الأقل'
        } else {
          formData.education.forEach((edu, index) => {
            if (!edu.degree) newErrors[`education_${index}_degree`] = 'الدرجة مطلوبة'
            if (!edu.major) newErrors[`education_${index}_major`] = 'التخصص مطلوب'
            if (!edu.university) newErrors[`education_${index}_university`] = 'الجامعة مطلوبة'
          })
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData)
    }
  }

  const updateFormData = (field: keyof ComprehensiveFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '', major: '', university: '', faculty: '',
        startDate: '', graduationDate: '', isPresent: false,
        gpa: '', gpaScale: '4.0', notes: ''
      }]
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">المعلومات الأساسية</h2>
        <p className="text-gray-600">أدخل معلوماتك الشخصية الأساسية</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateFormData('fullName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="أحمد محمد العلي"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الميلاد *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المدينة *
          </label>
          <select
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">اختر المدينة</option>
            {jordanianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف / WhatsApp *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+962778123456"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ahmad@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رابط LinkedIn *
          </label>
          <input
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 ${
              errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.linkedin.com/in/your-profile"
          />
          {errors.linkedinUrl && <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>}
          <p className="text-sm text-gray-500 mt-1">
            💡 وجود بروفايل قوي على LinkedIn يزيد فرصك بشكل كبير في سوق العمل
          </p>
        </div>
      </div>
    </div>
  )

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">التعليم</h2>
        <p className="text-gray-600">أضف معلومات التعليم والدرجات العلمية</p>
      </div>

      {formData.education.map((edu, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">درجة علمية {index + 1}</h3>
            {formData.education.length > 1 && (
              <button
                onClick={() => removeEducation(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدرجة *
              </label>
              <select
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">اختر الدرجة</option>
                {degrees.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التخصص *
              </label>
              <input
                type="text"
                value={edu.major}
                onChange={(e) => updateEducation(index, 'major', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="هندسة الحاسوب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجامعة *
              </label>
              <select
                value={edu.university}
                onChange={(e) => updateEducation(index, 'university', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">اختر الجامعة</option>
                {jordanianUniversities.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكلية *
              </label>
              <input
                type="text"
                value={edu.faculty}
                onChange={(e) => updateEducation(index, 'faculty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="كلية الهندسة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البداية
              </label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ التخرج
              </label>
              <div className="space-y-2">
                <input
                  type="month"
                  value={edu.graduationDate}
                  onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                  disabled={edu.isPresent}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={edu.isPresent}
                    onChange={(e) => updateEducation(index, 'isPresent', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">لم أتخرج بعد</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المعدل (اختياري)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={edu.gpa}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="3.5"
                />
                <select
                  value={edu.gpaScale}
                  onChange={(e) => updateEducation(index, 'gpaScale', e.target.value)}
                  className="w-20 px-2 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="4.0">4.0</option>
                  <option value="5.0">5.0</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={edu.notes}
                onChange={(e) => updateEducation(index, 'notes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="أي معلومات إضافية..."
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addEducation}
        className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus />
        إضافة درجة علمية أخرى
      </button>

      {errors.education && <p className="text-red-500 text-sm">{errors.education}</p>}
    </div>
  )

  // Continue with other render functions...
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderEducation()
      // Add other cases for remaining steps
      default:
        return <div>Step {currentStep} content coming soon...</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${i + 1 <= currentStep ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                animate={{ scale: i + 1 === currentStep ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {i + 1}
              </motion.div>
              {i < totalSteps - 1 && (
                <motion.div
                  className={`h-1 w-8 mx-1 rounded-full
                    ${i + 1 < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i + 1 < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-gray-600">
          {stepTitles[currentStep - 1]} - {currentStep}/{totalSteps}
        </p>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft />
          السابق
        </button>

        {currentStep === totalSteps ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            إرسال الطلب
            <FaCheck />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            التالي
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  )
}