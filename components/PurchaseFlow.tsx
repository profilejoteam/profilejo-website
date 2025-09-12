'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa'
import PricingSection from './PricingSection'
import PaymentSection from './PaymentSection'
import ComprehensiveForm from './ComprehensiveForm'

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  currency: string
  duration: string
  description: string
  features: string[]
  highlight?: boolean
  popular?: boolean
  icon: React.ComponentType<any>
  buttonText: string
  savings?: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  features: string[]
  processingTime: string
  fee?: string
}

interface FormData {
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

interface PurchaseFlowProps {
  onSubmit: (data: FormData & { selectedPlan: Plan; selectedPayment: PaymentMethod }) => void
}

export default function PurchaseFlow({ onSubmit }: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)

  const steps = [
    { id: 1, title: 'اختر الخطة', description: 'اختر الخطة المناسبة لاحتياجاتك' },
    { id: 2, title: 'طريقة الدفع', description: 'اختر طريقة الدفع المفضلة' },
    { id: 3, title: 'البيانات الشخصية', description: 'أدخل بياناتك الشخصية والمهنية' }
  ]

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment)
  }

  const handleFormSubmit = (data: FormData) => {
    setFormData(data)
    // Directly proceed to final submission after form is filled
    handleFinalSubmit(data)
  }

  const handleFinalSubmit = (data?: FormData) => {
    const finalData = data || formData
    if (selectedPlan && selectedPayment && finalData) {
      // Handle payment flow before submitting
      handlePaymentFlow()
      
      onSubmit({
        ...finalData,
        selectedPlan,
        selectedPayment
      })
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedPlan !== null
      case 2:
        return selectedPayment !== null
      default:
        return false
    }
  }

  const goToNextStep = () => {
    if (canProceedToNextStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentFlow = () => {
    if (!selectedPayment || !selectedPlan) return

    switch (selectedPayment.id) {
      case 'paypal':
        // Redirect to PayPal
        window.open(`https://paypal.me/profilejo/${selectedPlan.price}`, '_blank')
        break
      case 'visa':
        // Redirect to payment gateway (you can integrate with Stripe, etc.)
        alert('سيتم توجيهك إلى صفحة الدفع الآمنة...')
        break
      case 'whatsapp':
        // Open WhatsApp with pre-filled message
        const message = `مرحباً، أريد الاشتراك في خطة ${selectedPlan.name} بقيمة ${selectedPlan.price} ${selectedPlan.currency}. هل يمكنكم مساعدتي في إتمام عملية الدفع؟`
        const whatsappUrl = `https://wa.me/962779999999?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${step.id <= currentStep 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                    }`}
                  animate={{ scale: step.id === currentStep ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.id < currentStep ? <FaCheck /> : step.id}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    className={`h-1 w-16 mx-2 rounded-full
                      ${step.id < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step.id < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <PricingSection 
              onPlanSelect={handlePlanSelect}
              selectedPlan={selectedPlan}
            />
          )}

          {currentStep === 2 && (
            <PaymentSection 
              onPaymentSelect={handlePaymentSelect}
              selectedPayment={selectedPayment}
              selectedPlan={selectedPlan}
            />
          )}

          {currentStep === 3 && (
            <div className="py-8">
              <div className="bg-white rounded-2xl shadow-lg mb-6 p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">ملخص طلبك</h3>
                <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-bold text-lg">{selectedPlan?.name}</div>
                    <div className="text-sm text-gray-600">{selectedPlan?.duration}</div>
                    <div className="text-sm text-gray-600">الدفع عبر: {selectedPayment?.name}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedPlan?.price} {selectedPlan?.currency}
                  </div>
                </div>
              </div>
              <ComprehensiveForm onSubmit={handleFormSubmit} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0">
          <div className="container mx-auto max-w-4xl flex justify-between">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft />
              السابق
            </button>

            <button
              onClick={goToNextStep}
              disabled={!canProceedToNextStep()}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
            >
              التالي
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}