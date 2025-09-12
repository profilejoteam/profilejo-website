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
        // Only check for required fields that are truly needed
        if (!formData.fullName.trim()) newErrors.fullName = 'الاسم الكامل مطلوب'
        if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب'
        if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب'
        if (!formData.linkedinUrl.trim()) newErrors.linkedinUrl = 'رابط LinkedIn مطلوب'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب'
        if (!formData.city) newErrors.city = 'المدينة مطلوبة'
        
        // Only validate format if field is not empty
        if (formData.fullName.trim()) {
          const nameError = validateFullName(formData.fullName)
          if (nameError) newErrors.fullName = nameError
        }
        if (formData.email.trim()) {
          const emailError = validateEmail(formData.email)
          if (emailError) newErrors.email = emailError
        }
        if (formData.phone.trim()) {
          const phoneError = validatePhone(formData.phone)
          if (phoneError) newErrors.phone = phoneError
        }
        if (formData.linkedinUrl.trim()) {
          const linkedinError = validateLinkedIn(formData.linkedinUrl)
          if (linkedinError) newErrors.linkedinUrl = linkedinError
        }
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
      
      // For other steps, make validation more lenient
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // Allow progression without strict validation for optional sections
        break
        
      case 8:
        // Only check required consents
        if (!formData.dataUsageConsent) {
          newErrors.dataUsageConsent = 'يجب الموافقة على استخدام البيانات'
        }
        break
    }

    setErrors(newErrors)
    const hasErrors = Object.keys(newErrors).filter(key => newErrors[key] !== '').length > 0
    
    // Log for debugging
    console.log('Validation errors:', newErrors)
    console.log('Has errors:', hasErrors)
    
    return !hasErrors
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
        <p className="text-sm text-green-600 mt-2">📝 هذه الخطوة مطلوبة - يرجى ملء جميع الحقول المطلوبة (*)</p>
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
        <p className="text-sm text-blue-600 mt-2">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
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
  const renderExperience = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">الخبرات العملية</h2>
        <p className="text-gray-600">أضف خبراتك العملية والتدريبات</p>
        <p className="text-sm text-blue-600 mt-2">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
      </div>

      {formData.experience.map((exp, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">خبرة عملية {index + 1}</h3>
            <button
              onClick={() => removeExperience(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المسمى الوظيفي *
              </label>
              <input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="مطور واجهات أمامية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجهة *
              </label>
              <input
                type="text"
                value={exp.organization}
                onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="شركة التكنولوجيا المتقدمة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموقع
              </label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateExperience(index, 'location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="عمان، الأردن"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع العمل
              </label>
              <select
                value={exp.employmentType}
                onChange={(e) => updateExperience(index, 'employmentType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">اختر نوع العمل</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البداية
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الانتهاء
              </label>
              <div className="space-y-2">
                <input
                  type="month"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  disabled={exp.isPresent}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exp.isPresent}
                    onChange={(e) => updateExperience(index, 'isPresent', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">أعمل حالياً</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المهام والمسؤوليات *
              </label>
              <textarea
                value={exp.responsibilities}
                onChange={(e) => updateExperience(index, 'responsibilities', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                rows={4}
                placeholder="اكتب 3-5 نقاط تشرح دورك وإنجازاتك بشكل رقمي: مثال — قللت زمن التحميل بنسبة 40%"
              />
              <p className="text-sm text-gray-500 mt-1">300-800 حرف</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإنجازات (اختياري)
              </label>
              <textarea
                value={exp.achievements}
                onChange={(e) => updateExperience(index, 'achievements', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="الإنجازات والجوائز المحققة في هذا المنصب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المرجع (اختياري)
              </label>
              <input
                type="text"
                value={exp.referenceName}
                onChange={(e) => updateExperience(index, 'referenceName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="اسم المشرف أو المرجع"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تواصل المرجع (اختياري)
              </label>
              <input
                type="text"
                value={exp.referenceContact}
                onChange={(e) => updateExperience(index, 'referenceContact', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="رقم هاتف أو بريد إلكتروني"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addExperience}
        className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus />
        إضافة خبرة عملية
      </button>
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">المشاريع</h2>
        <p className="text-gray-600">أضف مشاريعك الشخصية والأكاديمية</p>
        <p className="text-sm text-blue-600 mt-2">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
      </div>

      {formData.projects.map((project, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">مشروع {index + 1}</h3>
            <button
              onClick={() => removeProject(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المشروع *
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(index, 'title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="تطبيق إدارة المهام"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                دورك في المشروع
              </label>
              <input
                type="text"
                value={project.role}
                onChange={(e) => updateProject(index, 'role', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="مطور رئيسي"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المشروع
              </label>
              <textarea
                value={project.description}
                onChange={(e) => updateProject(index, 'description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="وصف مختصر للمشروع وأهدافه (100-300 حرف)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط العرض التوضيحي
              </label>
              <input
                type="url"
                value={project.demoLink}
                onChange={(e) => updateProject(index, 'demoLink', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="https://demo.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط المستودع
              </label>
              <input
                type="url"
                value={project.repositoryUrl}
                onChange={(e) => updateProject(index, 'repositoryUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="https://github.com/username/project"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقنيات المستخدمة
              </label>
              <input
                type="text"
                value={project.technologies.join(', ')}
                onChange={(e) => updateProject(index, 'technologies', e.target.value.split(', '))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="React, Node.js, MongoDB"
              />
              <p className="text-sm text-gray-500 mt-1">افصل بين التقنيات بفاصلة</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.isPublic}
                  onChange={(e) => updateProject(index, 'isPublic', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">مشروع عام</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addProject}
        className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus />
        إضافة مشروع
      </button>
    </div>
  )

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">المهارات</h2>
        <p className="text-gray-600">أضف مهاراتك التقنية والشخصية</p>
        <p className="text-sm text-blue-600 mt-2">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
      </div>

      {formData.skills.map((skill, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="JavaScript"
              />
            </div>
            
            <div className="w-32">
              <select
                value={skill.proficiency}
                onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              >
                <option value="">المستوى</option>
                {skillProficiencies.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <input
                type="number"
                min="0"
                max="20"
                value={skill.yearsOfExperience}
                onChange={(e) => updateSkill(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                placeholder="سنوات"
              />
            </div>

            <button
              onClick={() => removeSkill(index)}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addSkill}
        className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
      >
        <FaPlus />
        إضافة مهارة (الحد الأقصى 30)
      </button>
    </div>
  )

  const renderLanguagesAndCertifications = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">اللغات والشهادات</h2>
        <p className="text-gray-600 text-center mb-4">أضف اللغات التي تتقنها والشهادات التي حصلت عليها</p>
        <p className="text-sm text-blue-600 text-center mb-6">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
        
        {/* Languages Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">اللغات</h3>
          {formData.languages.map((lang, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="الإنجليزية"
                  />
                </div>
                
                <div className="w-40">
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">المستوى</option>
                    {languageProficiencies.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => removeLanguage(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={addLanguage}
            className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus />
            إضافة لغة
          </button>
        </div>

        {/* Certifications Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">الشهادات والدورات</h3>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">شهادة {index + 1}</h4>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={cert.title}
                    onChange={(e) => updateCertification(index, 'title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="اسم الشهادة"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="الجهة المصدرة"
                  />
                </div>

                <div>
                  <input
                    type="month"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <input
                    type="month"
                    value={cert.expiryDate}
                    onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="تاريخ الانتهاء (اختياري)"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={cert.credentialId}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="رقم الشهادة"
                  />
                </div>

                <div>
                  <input
                    type="url"
                    value={cert.credentialUrl}
                    onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="رابط التحقق"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={addCertification}
            className="w-full py-3 px-6 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus />
            إضافة شهادة
          </button>
        </div>
      </div>
    </div>
  )

  const renderJobPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تفضيلات العمل</h2>
        <p className="text-gray-600">حدد تفضيلاتك لفرص العمل المستقبلية</p>
        <p className="text-sm text-blue-600 mt-2">💡 هذه الخطوة اختيارية - يمكنك تخطيها والعودة لاحقاً</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الوظائف المطلوبة
          </label>
          <input
            type="text"
            value={formData.preferredRoles.join(', ')}
            onChange={(e) => updateFormData('preferredRoles', e.target.value.split(', '))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            placeholder="مطور ويب، مصمم UI/UX"
          />
          <p className="text-sm text-gray-500 mt-1">افصل بين الوظائف بفاصلة</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصناعات المفضلة
          </label>
          <input
            type="text"
            value={formData.preferredIndustries.join(', ')}
            onChange={(e) => updateFormData('preferredIndustries', e.target.value.split(', '))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            placeholder="التكنولوجيا، التعليم، الصحة"
          />
          <p className="text-sm text-gray-500 mt-1">افصل بين الصناعات بفاصلة</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            متى يمكنك البدء؟
          </label>
          <input
            type="date"
            value={formData.availabilityDate}
            onChange={(e) => updateFormData('availabilityDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع العمل المرغوب
          </label>
          <select
            value={formData.desiredJobType}
            onChange={(e) => updateFormData('desiredJobType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="">اختر نوع العمل</option>
            {jobTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            النطاق المتوقع للراتب (اختياري)
          </label>
          <input
            type="text"
            value={formData.expectedSalaryRange}
            onChange={(e) => updateFormData('expectedSalaryRange', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
            placeholder="500-800 دينار"
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.willingToRelocate}
              onChange={(e) => updateFormData('willingToRelocate', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">مستعد للانتقال لمدينة أخرى</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remoteOk}
              onChange={(e) => updateFormData('remoteOk', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">أفضل العمل عن بُعد</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderFilesAndConsents = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">الملفات والموافقات</h2>
        <p className="text-gray-600">ارفع ملفاتك ووافق على الشروط</p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          صورة شخصية * (JPG/PNG ≤2MB)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <FaCamera className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">اختر صورة شخصية واضحة ومهنية</p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => updateFormData('photo', e.target.files?.[0])}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600"
          >
            <FaUpload className="mr-2" />
            رفع صورة
          </label>
        </div>
      </div>

      {/* Portfolio Files */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نماذج أعمال / Portfolio (اختياري)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">ارفع نماذج من أعمالك (PDF, DOC, أو صور)</p>
          <input
            type="file"
            multiple
            onChange={(e) => updateFormData('portfolioFiles', Array.from(e.target.files || []))}
            className="hidden"
            id="portfolio-upload"
          />
          <label
            htmlFor="portfolio-upload"
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-600"
          >
            <FaUpload className="mr-2" />
            رفع ملفات
          </label>
        </div>
      </div>

      {/* Consents */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">الموافقات المطلوبة</h3>
        
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.dataUsageConsent}
              onChange={(e) => updateFormData('dataUsageConsent', e.target.checked)}
              className="mt-1 mr-3"
              required
            />
            <span className="text-sm">
              <strong>مطلوب:</strong> أوافق على تخزين بياناتي واستخدامها لمقابلات وفرص عمل. 
              هذه الموافقة ضرورية لتقديم الخدمة.
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={formData.marketingConsent}
              onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
              className="mt-1 mr-3"
            />
            <span className="text-sm">
              <strong>اختياري:</strong> أوافق على استلام عروض ورسائل ترويجية عبر البريد الإلكتروني 
              أو الواتساب حول فرص عمل جديدة وخدمات إضافية.
            </span>
          </label>
        </div>

        {!formData.dataUsageConsent && (
          <p className="text-red-500 text-sm mt-2">
            يجب الموافقة على استخدام البيانات لإتمام التسجيل
          </p>
        )}
      </div>
    </div>
  )

  // Helper functions for array operations
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        jobTitle: '', organization: '', location: '', startDate: '', endDate: '',
        isPresent: false, responsibilities: '', achievements: '', employmentType: '',
        referenceName: '', referenceContact: ''
      }]
    }))
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: '', description: '', role: '', startDate: '', endDate: '',
        technologies: [], demoLink: '', repositoryUrl: '', isPublic: true, files: []
      }]
    }))
  }

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const updateProject = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }))
  }

  const addSkill = () => {
    if (formData.skills.length < 30) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, { name: '', proficiency: '', yearsOfExperience: 0 }]
      }))
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const updateSkill = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }))
  }

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: '' }]
    }))
  }

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateLanguage = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        title: '', issuer: '', issueDate: '', expiryDate: '',
        credentialId: '', credentialUrl: ''
      }]
    }))
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderEducation()
      case 3:
        return renderExperience()
      case 4:
        return renderProjects()
      case 5:
        return renderSkills()
      case 6:
        return renderLanguagesAndCertifications()
      case 7:
        return renderJobPreferences()
      case 8:
        return renderFilesAndConsents()
      default:
        return <div>Step {currentStep} content</div>
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

        <div className="flex gap-3">
          {/* Quick Jump to Final Step for Basic Users */}
          {currentStep === 1 && (
            <button
              onClick={() => setCurrentStep(totalSteps)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              انتقال سريع للإنهاء
              <FaArrowRight />
            </button>
          )}

          {/* Skip button for optional steps */}
          {(currentStep >= 3 && currentStep <= 7) && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
            >
              تخطي
              <FaArrowRight />
            </button>
          )}

          {currentStep === totalSteps ? (
            <button
              onClick={handleSubmit}
              disabled={!formData.dataUsageConsent}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}