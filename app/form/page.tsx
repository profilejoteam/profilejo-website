'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PurchaseFlow from '../../components/PurchaseFlow'
import SuccessSection from '@/components/SuccessSection'
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

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  duration: string
  description: string
  features: string[]
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  processingTime: string
}

export default function FormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<BasicFormData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth')
      }
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handlePurchaseSubmit = async (data: BasicFormData & { selectedPlan: Plan; selectedPayment: PaymentMethod }) => {
    try {
      // Save to Supabase with comprehensive data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          city: data.city,
          linkedin_url: data.linkedinUrl,
          education: data.education,
          experience: data.experience,
          projects: data.projects,
          skills: data.skills,
          languages: data.languages,
          certifications: data.certifications,
          preferred_roles: data.preferredRoles,
          preferred_industries: data.preferredIndustries,
          availability_date: data.availabilityDate,
          desired_job_type: data.desiredJobType,
          willing_to_relocate: data.willingToRelocate,
          expected_salary_range: data.expectedSalaryRange,
          remote_ok: data.remoteOk,
          portfolio_files: [], // Will handle file uploads separately
          data_usage_consent: data.dataUsageConsent,
          marketing_consent: data.marketingConsent,
          selected_plan: data.selectedPlan.id,
          plan_name: data.selectedPlan.name,
          plan_price: data.selectedPlan.price,
          plan_currency: data.selectedPlan.currency,
          payment_method: data.selectedPayment.id,
          payment_status: 'pending',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving data:', error)
        alert('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.')
        return
      }

      console.log('Purchase submitted and saved:', data)
      setSubmittedData(data)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return <SuccessSection />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">ب</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">بروفايل</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                مرحباً، {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 transition-colors text-sm"
              >
                تسجيل الخروج
              </button>
              <a 
                href="/"
                className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2"
              >
                ← العودة للصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Purchase Flow */}
      <PurchaseFlow onSubmit={handlePurchaseSubmit} />
    </div>
  )
}
