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
      console.log('Starting form submission...')
      
      // Upload files first if they exist
      const uploadedFiles = []
      let photoUrl = null

      // Upload photo if exists
      if (data.photo) {
        try {
          const photoExtension = data.photo.name.split('.').pop()
          const photoPath = `photos/${user.id}_${Date.now()}.${photoExtension}`
          
          const { data: photoData, error: photoError } = await supabase.storage
            .from('profile-files')
            .upload(photoPath, data.photo)

          if (photoError) {
            console.error('Error uploading photo:', photoError)
            // Continue without photo if upload fails
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('profile-files')
              .getPublicUrl(photoPath)
            photoUrl = publicUrl
            console.log('Photo uploaded successfully:', publicUrl)
          }
        } catch (photoUploadError) {
          console.error('Photo upload failed:', photoUploadError)
          // Continue without photo
        }
      }

      // Upload portfolio files if they exist
      if (data.portfolioFiles && data.portfolioFiles.length > 0) {
        for (const file of data.portfolioFiles) {
          try {
            const fileExtension = file.name.split('.').pop()
            const filePath = `portfolio/${user.id}_${Date.now()}_${file.name}`
            
            const { data: fileData, error: fileError } = await supabase.storage
              .from('profile-files')
              .upload(filePath, file)

            if (fileError) {
              console.error('Error uploading file:', fileError)
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('profile-files')
                .getPublicUrl(filePath)
              uploadedFiles.push({
                name: file.name,
                url: publicUrl,
                type: file.type,
                size: file.size
              })
              console.log('Portfolio file uploaded:', file.name)
            }
          } catch (fileUploadError) {
            console.error('File upload failed for:', file.name, fileUploadError)
            // Continue with other files
          }
        }
      }

      // Prepare data for database
      const profileData = {
        user_id: user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        city: data.city,
        linkedin_url: data.linkedinUrl,
        education: data.education || [],
        experience: data.experience || [],
        projects: data.projects || [],
        skills: data.skills || [],
        languages: data.languages || [],
        certifications: data.certifications || [],
        preferred_roles: data.preferredRoles || [],
        preferred_industries: data.preferredIndustries || [],
        availability_date: data.availabilityDate || null,
        desired_job_type: data.desiredJobType || null,
        willing_to_relocate: data.willingToRelocate || false,
        expected_salary_range: data.expectedSalaryRange || null,
        remote_ok: data.remoteOk || false,
        photo_url: photoUrl,
        portfolio_files: uploadedFiles,
        data_usage_consent: data.dataUsageConsent,
        marketing_consent: data.marketingConsent || false,
        selected_plan: data.selectedPlan.id,
        plan_name: data.selectedPlan.name,
        plan_price: data.selectedPlan.price,
        plan_currency: data.selectedPlan.currency,
        payment_method: data.selectedPayment.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      }

      console.log('Saving profile data:', profileData)

      // Save to Supabase with comprehensive data
      const { data: savedData, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()

      if (error) {
        console.error('Error saving data:', error)
        alert(`حدث خطأ أثناء حفظ البيانات: ${error.message}. يرجى المحاولة مرة أخرى.`)
        return
      }

      console.log('Data saved successfully:', savedData)
      console.log('Purchase submitted and saved:', data)
      setSubmittedData(data)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Unexpected error:', error)
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Purchase Flow */}
      <PurchaseFlow onSubmit={handlePurchaseSubmit} />
    </div>
  )
}
