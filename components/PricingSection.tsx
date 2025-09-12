'use client'

import { motion } from 'framer-motion'
import { FaCheck, FaCrown, FaStar, FaRocket } from 'react-icons/fa'
import { useState } from 'react'

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

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'الأساسية',
    price: 25,
    currency: 'JOD',
    duration: 'شهر واحد',
    description: 'مثالية للمبتدئين الذين يريدون بناء بروفايل مهني بسيط',
    features: [
      'إنشاء بروفايل شخصي أساسي',
      'كتابة سيرة ذاتية احترافية',
      'تحسين LinkedIn الأساسي',
      'دعم فني لمدة شهر',
      'مراجعة واحدة مجانية'
    ],
    icon: FaCheck,
    buttonText: 'اختر الأساسية'
  },
  {
    id: 'professional',
    name: 'المهنية',
    price: 45,
    originalPrice: 60,
    currency: 'JOD',
    duration: 'شهرين',
    description: 'الأكثر شعبية! مناسبة للمهنيين الذين يريدون تطوير حضورهم المهني',
    features: [
      'جميع ميزات الخطة الأساسية',
      'استراتيجية بحث عن عمل مخصصة',
      'تدريب على المقابلات الشخصية',
      'تحسين متقدم لـ LinkedIn',
      'بناء استراتيجية العلامة الشخصية',
      'دعم فني لمدة شهرين',
      'مراجعات غير محدودة'
    ],
    highlight: true,
    popular: true,
    icon: FaCrown,
    buttonText: 'اختر المهنية',
    savings: 'وفر 25%'
  },
  {
    id: 'premium',
    name: 'المتميزة',
    price: 75,
    originalPrice: 100,
    currency: 'JOD',
    duration: '3 أشهر',
    description: 'للمهنيين الطموحين الذين يريدون التميز في سوق العمل',
    features: [
      'جميع ميزات الخطة المهنية',
      'تطوير مهارات مخصص',
      'استشارة مهنية فردية (ساعة واحدة)',
      'إنشاء portfolio احترافي',
      'تحليل السوق والمنافسين',
      'خطة تطوير مهني لـ 6 أشهر',
      'دعم فني لمدة 3 أشهر',
      'مراجعات غير محدودة + استشارات'
    ],
    highlight: false,
    icon: FaRocket,
    buttonText: 'اختر المتميزة',
    savings: 'وفر 25%'
  }
]

interface PricingSectionProps {
  onPlanSelect: (plan: Plan) => void
  selectedPlan?: Plan | null
}

export default function PricingSection({ onPlanSelect, selectedPlan }: PricingSectionProps) {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            اختر الخطة المناسبة لك
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            خطط مرنة مصممة لتناسب احتياجاتك المهنية وميزانيتك
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-3xl p-8 shadow-lg border transition-all duration-300 group cursor-pointer
                ${plan.highlight ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200 hover:border-primary-300'}
                ${selectedPlan?.id === plan.id ? 'ring-4 ring-primary-200 border-primary-500' : ''}
              `}
              onClick={() => onPlanSelect(plan)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  >
                    <FaStar className="text-xs" />
                    الأكثر شعبية
                  </motion.div>
                </div>
              )}

              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {plan.savings}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
                  ${plan.highlight ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'}
                  group-hover:scale-110 transition-transform duration-300`}>
                  <plan.icon className="text-3xl text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mr-2">
                      {plan.originalPrice} {plan.currency}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary-600">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 mr-2">{plan.currency}</span>
                  <div className="text-gray-500 text-sm mt-1">
                    {plan.duration}
                  </div>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: featureIndex * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <FaCheck className="text-green-600 text-xs" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <button
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 border-2
                  ${plan.highlight 
                    ? 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 hover:border-primary-600' 
                    : 'bg-white text-primary-600 border-primary-500 hover:bg-primary-50'
                  }
                  ${selectedPlan?.id === plan.id ? 'ring-2 ring-primary-300' : ''}
                  group-hover:transform group-hover:scale-105`}
              >
                {selectedPlan?.id === plan.id ? 'تم الاختيار ✓' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            💡 جميع الخطط تشمل ضمان استرداد الأموال خلال 7 أيام
          </p>
          <p className="text-sm text-gray-500">
            الأسعار شاملة ضريبة المبيعات • دفع آمن ومشفر
          </p>
        </motion.div>
      </div>
    </section>
  )
}