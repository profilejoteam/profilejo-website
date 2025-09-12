'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaUser } from 'react-icons/fa'

interface BasicFormData {
  fullName: string
  dateOfBirth: string
  city: string
  phone: string
  email: string
  linkedinUrl: string
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
  dataUsageConsent: boolean
  marketingConsent: boolean
}

export default function FormSection({ onSubmit }: { onSubmit: (data: BasicFormData) => void }) {
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

  const handleSubmit = () => {
    onSubmit(formData)
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-2xl text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">النموذج المبسط</h3>
            <p className="text-gray-600">استخدم النموذج الجديد المحسن</p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              يرجى استخدام النموذج المحدث الجديد بدلاً من هذا النموذج
            </p>
            <button
              onClick={handleSubmit}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              متابعة مع النموذج الجديد
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
