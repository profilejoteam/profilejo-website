'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaUser, FaGraduationCap, FaBriefcase, FaLink, FaArrowRight, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface FormData {
  // Basic required fields
  fullName: string
  dateOfBirth: string
  city: string
  phone: string
  email: string
  linkedinUrl: string
  
  // Education (repeatable)
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
    diplomaFile?: File
    notes: string
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
    proofFile?: File
    referenceName: string
    referenceContact: string
  }>
  
  // Projects (repeatable)
  projects: Array<{
    title: string
    description: string
    role: string
    startDate: string
    endDate: string
    technologies: string[]
    demoUrl: string
    repositoryUrl: string
    files: File[]
    isPublic: boolean
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
  
  // File uploads
  photo?: File
  portfolioFiles: File[]
  
  // Legal consents
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

const PersonalInfoStep = ({ data, onChange }: { data: Pick<FormData, 'fullName' | 'dateOfBirth' | 'city' | 'phone' | 'email' | 'linkedinUrl'>; onChange: (data: Pick<FormData, 'fullName' | 'dateOfBirth' | 'city' | 'phone' | 'email' | 'linkedinUrl'>) => void }) => (
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
      <p className="text-gray-600">نحتاج بعض المعلومات الأساسية عنك</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-gray-700 font-medium mb-2">الاسم الكامل *</label>
        <input
          type="text"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="اكتب اسمك الكامل"
          value={data.fullName}
          onChange={(e) => onChange({ ...data, fullName: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-medium mb-2">تاريخ الميلاد *</label>
        <input
          type="date"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
          value={data.dateOfBirth}
          onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">المدينة *</label>
        <input
          type="text"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="مدينة السكن"
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">رقم الهاتف *</label>
        <input
          type="tel"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="+966 50 123 4567"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني *</label>
        <input
          type="email"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="your.email@example.com"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">رابط LinkedIn</label>
        <input
          type="url"
          className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
          placeholder="https://linkedin.com/in/yourprofile"
          value={data.linkedinUrl}
          onChange={(e) => onChange({ ...data, linkedinUrl: e.target.value })}
        />
        <p className="text-orange-600 text-sm mt-2 flex items-start gap-2">
          <span>⚠️</span>
          وجود بروفايل قوي على LinkedIn يزيد فرصك بشكل كبير في سوق العمل.
        </p>
      </div>
    </div>
  </motion.div>
)

export default function FormSection({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    // Basic required fields
    fullName: '',
    dateOfBirth: '',
    city: '',
    phone: '',
    email: '',
    linkedinUrl: '',
    
    // Education
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
    
    // Experience
    experience: [{
      jobTitle: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      isPresent: false,
      responsibilities: '',
      achievements: '',
      employmentType: '',
      referenceName: '',
      referenceContact: ''
    }],
    
    // Projects
    projects: [],
    
    // Skills
    skills: [],
    
    // Languages
    languages: [
      { language: 'العربية', proficiency: 'Native' },
      { language: 'English', proficiency: '' }
    ],
    
    // Certifications
    certifications: [],
    
    // Job preferences
    preferredRoles: [],
    preferredIndustries: [],
    availabilityDate: '',
    desiredJobType: '',
    willingToRelocate: false,
    expectedSalaryRange: '',
    remoteOk: false,
    
    // File uploads
    portfolioFiles: [],
    
    // Legal consents
    dataUsageConsent: false,
    marketingConsent: false
  })

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
              email: profile.email || '',
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
              experience: profile.experience || [{
                jobTitle: '',
                organization: '',
                location: '',
                startDate: '',
                endDate: '',
                isPresent: false,
                responsibilities: '',
                achievements: '',
                employmentType: '',
                referenceName: '',
                referenceContact: ''
              }],
              projects: profile.projects || [],
              skills: profile.skills || [],
              languages: profile.languages || [
                { language: 'العربية', proficiency: 'Native' },
                { language: 'English', proficiency: '' }
              ],
              certifications: profile.certifications || [],
              preferredRoles: profile.preferred_roles || [],
              preferredIndustries: profile.preferred_industries || [],
              availabilityDate: profile.availability_date || '',
              desiredJobType: profile.desired_job_type || '',
              willingToRelocate: profile.willing_to_relocate || false,
              expectedSalaryRange: profile.expected_salary_range || '',
              remoteOk: profile.remote_ok || false,
              portfolioFiles: [],
              dataUsageConsent: profile.data_usage_consent || false,
              marketingConsent: profile.marketing_consent || false
            })
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

  const totalSteps = 4

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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
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
      }]
    })
  }

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    })
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, {
        jobTitle: '',
        organization: '',
        location: '',
        startDate: '',
        endDate: '',
        isPresent: false,
        responsibilities: '',
        achievements: '',
        employmentType: '',
        referenceName: '',
        referenceContact: ''
      }]
    })
  }

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    })
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
          />
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaGraduationCap className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">التعليم والشهادات</h3>
              <p className="text-gray-600">أضف معلومات تعليمك والشهادات الحاصل عليها</p>
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">شهادة {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الدرجة العلمية *</label>
                    <select
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].degree = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    >
                      <option value="">اختر الدرجة العلمية</option>
                      <option value="ثانوية عامة">ثانوية عامة</option>
                      <option value="دبلوم">دبلوم</option>
                      <option value="بكالوريوس">بكالوريوس</option>
                      <option value="ماجستير">ماجستير</option>
                      <option value="دكتوراه">دكتوراه</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">التخصص *</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="مثال: هندسة الحاسوب"
                      value={edu.major}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].major = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الجامعة *</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="اسم الجامعة"
                      value={edu.university}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].university = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">الكلية *</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="اسم الكلية"
                      value={edu.faculty}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].faculty = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ الالتحاق</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].startDate = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ التخرج</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
                      value={edu.graduationDate}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].graduationDate = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">المعدل التراكمي</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="مثال: 3.75 من 4.00"
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEducation = [...formData.education]
                        newEducation[index].gpa = e.target.value
                        setFormData({ ...formData, education: newEducation })
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addEducation}
              className="w-full px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus /> إضافة شهادة أخرى
            </button>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBriefcase className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">الخبرة العملية</h3>
              <p className="text-gray-600">أضف خبراتك العملية والمشاريع التي عملت عليها</p>
            </div>

            {formData.experience.map((exp, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">خبرة {index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">المسمى الوظيفي *</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="مثال: مطور ويب"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[index].jobTitle = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">المؤسسة *</label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                      placeholder="اسم الشركة أو المؤسسة"
                      value={exp.organization}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[index].organization = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ البداية</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[index].startDate = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">تاريخ النهاية</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary-500 focus:outline-none transition-colors"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[index].endDate = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">المسؤوليات والإنجازات</label>
                    <textarea
                      className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors h-32 resize-none"
                      placeholder="اكتب عن مسؤولياتك وإنجازاتك في هذا المنصب..."
                      value={exp.responsibilities}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[index].responsibilities = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addExperience}
              className="w-full px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus /> إضافة خبرة أخرى
            </button>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaLink className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">الروابط الإضافية</h3>
              <p className="text-gray-600">أضف روابط حساباتك المهنية ومعرض أعمالك</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">LinkedIn (مطلوب) *</label>
                <input
                  type="url"
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    linkedinUrl: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">GitHub (اختياري)</label>
                <input
                  type="url"
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="https://github.com/yourusername"
                  value=""
                  onChange={(e) => {
                    // TODO: Add github field to FormData if needed
                  }}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">معرض الأعمال (اختياري)</label>
                <input
                  type="url"
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="https://yourportfolio.com"
                  value=""
                  onChange={(e) => {
                    // TODO: Add portfolio field to FormData if needed
                  }}
                />
              </div>
            </div>

            <div className="bg-secondary-500/20 rounded-2xl p-6 border border-secondary-400/30">
              <h4 className="text-lg font-semibold text-white mb-4">نصائح مهمة:</h4>
              <ul className="text-white/80 space-y-2">
                <li>• تأكد من أن بروفايل LinkedIn محدث ومكتمل</li>
                <li>• أضف صورة مهنية عالية الجودة</li>
                <li>• اكتب وصف مقنع يبرز خبراتك ومهاراتك</li>
                <li>• أضف شهاداتك ومشاريعك السابقة</li>
              </ul>
            </div>
          </motion.div>
        )
      default:
        return null
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
