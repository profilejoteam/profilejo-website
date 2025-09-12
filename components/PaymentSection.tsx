'use client'

import { motion } from 'framer-motion'
import { FaPaypal, FaCreditCard, FaWhatsapp, FaShieldAlt, FaCheck } from 'react-icons/fa'
import { useState } from 'react'

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

const paymentMethods: PaymentMethod[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'الدفع الآمن عبر PayPal - مقبول عالمياً',
    icon: FaPaypal,
    color: 'bg-blue-500',
    features: [
      'حماية المشتري',
      'دفع فوري',
      'مقبول عالمياً',
      'آمن ومشفر'
    ],
    processingTime: 'فوري',
    fee: 'بدون رسوم إضافية'
  },
  {
    id: 'visa',
    name: 'بطاقة ائتمانية',
    description: 'فيزا، ماستركارد، أو أي بطاقة ائتمانية',
    icon: FaCreditCard,
    color: 'bg-green-600',
    features: [
      'جميع البطاقات الائتمانية',
      'دفع آمن ومشفر',
      'معالجة سريعة',
      'حماية SSL'
    ],
    processingTime: 'فوري',
    fee: 'بدون رسوم إضافية'
  },
  {
    id: 'whatsapp',
    name: 'واتساب',
    description: 'تواصل معنا عبر واتساب لإتمام الدفع',
    icon: FaWhatsapp,
    color: 'bg-green-500',
    features: [
      'تواصل مباشر',
      'دعم شخصي',
      'طرق دفع متنوعة',
      'استشارة مجانية'
    ],
    processingTime: 'خلال ساعات العمل',
    fee: 'حسب طريقة الدفع'
  }
]

interface PaymentSectionProps {
  onPaymentSelect: (method: PaymentMethod) => void
  selectedPayment?: PaymentMethod | null
  selectedPlan?: any
}

export default function PaymentSection({ onPaymentSelect, selectedPayment, selectedPlan }: PaymentSectionProps) {
  if (!selectedPlan) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">يرجى اختيار خطة أولاً</p>
      </div>
    )
  }

  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            اختر طريقة الدفع
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          
          {/* Selected Plan Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-2">الخطة المختارة</h3>
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {selectedPlan.name}
            </div>
            <div className="text-xl">
              {selectedPlan.price} {selectedPlan.currency}
              {selectedPlan.originalPrice && (
                <span className="text-sm text-gray-500 line-through mr-2">
                  {selectedPlan.originalPrice} {selectedPlan.currency}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedPlan.duration}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                ${selectedPayment?.id === method.id 
                  ? 'border-primary-500 ring-4 ring-primary-100' 
                  : 'border-gray-200 hover:border-primary-300'
                }`}
              onClick={() => onPaymentSelect(method)}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {method.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {method.description}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {method.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-green-600 text-xs" />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">وقت المعالجة:</span>
                  <span className="font-medium">{method.processingTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الرسوم:</span>
                  <span className="font-medium text-green-600">{method.fee}</span>
                </div>
              </div>

              <button
                className={`w-full mt-6 py-3 px-6 rounded-xl font-bold transition-all duration-300 border-2
                  ${selectedPayment?.id === method.id
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary-50 hover:border-primary-300'
                  }`}
              >
                {selectedPayment?.id === method.id ? 'تم الاختيار ✓' : `اختر ${method.name}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 rounded-xl p-6 mt-12 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">
              أمان وحماية مضمونة
            </h4>
            <p className="text-blue-700 text-sm">
              جميع المعاملات محمية بتشفير SSL 256-bit وتلتزم بأعلى معايير الأمان العالمية. 
              بياناتك المالية آمنة ولن يتم تخزينها على خوادمنا.
            </p>
          </div>
        </motion.div>

        {/* Total Summary */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-6 mt-8"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">المجموع:</span>
              <span className="text-2xl font-bold text-primary-600">
                {selectedPlan.price} {selectedPlan.currency}
              </span>
            </div>
            <div className="text-sm text-gray-600 text-center">
              طريقة الدفع: {selectedPayment.name} • {selectedPayment.processingTime}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}