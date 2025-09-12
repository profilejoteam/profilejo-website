'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface StatItem {
  number: number
  label: string
  suffix: string
  prefix?: string
}

const stats: StatItem[] = [
  { number: 5000, suffix: '+', label: 'عميل راضي' },
  { number: 98, suffix: '%', label: 'معدل النجاح' },
  { number: 300, suffix: '%', label: 'زيادة في المقابلات' },
  { number: 7, suffix: '', label: 'أيام متوسط التسليم' },
  { number: 150, suffix: '+', label: 'شركة شريكة' },
  { number: 24, suffix: '/7', label: 'دعم مستمر' }
]

const CountUpNumber = ({ number, suffix, prefix = '', duration = 2000 }: {
  number: number
  suffix: string
  prefix?: string
  duration?: number
}) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      let startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setCount(Math.floor(number * easeOut))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isVisible, number, duration])

  return (
    <div ref={elementRef} className="text-4xl md:text-5xl font-bold text-white mb-2">
      {prefix}{count.toLocaleString('ar-SA')}{suffix}
    </div>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            أرقام تتحدث عن نفسها
          </h2>
          <div className="w-24 h-1 bg-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            نفخر بالثقة التي يضعها عملاؤنا فينا والنتائج المتميزة التي نحققها معاً
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="mb-4">
                  <CountUpNumber 
                    number={stat.number} 
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                  <div className="w-16 h-1 bg-secondary-500 mx-auto mb-3 group-hover:w-20 transition-all duration-300"></div>
                  <p className="text-lg text-white/90 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional info section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">🎯 هدفنا</h3>
              <p className="text-white/90 leading-relaxed">
                مساعدة الشباب العربي في بناء مستقبل مهني مشرق من خلال تطوير هويتهم المهنية وتعزيز فرصهم في سوق العمل
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">🚀 رؤيتنا</h3>
              <p className="text-white/90 leading-relaxed">
                أن نكون المنصة الأولى في المنطقة العربية لتطوير الهوية المهنية وربط المواهب بالفرص المناسبة
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
