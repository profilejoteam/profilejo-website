'use client'

import { motion } from 'framer-motion'
import { FaStar, FaQuoteRight } from 'react-icons/fa'
import { useState, useEffect } from 'react'

const testimonials = [
  {
    name: 'أحمد السالم',
    position: 'مهندس برمجيات',
    company: 'شركة التقنية المتقدمة',
    rating: 5,
    comment: 'بفضل فريق بروفايل، تمكنت من الحصول على وظيفة أحلامي خلال شهر واحد فقط. السيرة الذاتية وبروفايل LinkedIn الجديد جعلاني أبدو كمحترف حقيقي.',
    image: '👨‍💻'
  },
  {
    name: 'فاطمة الزهراني',
    position: 'مديرة تسويق',
    company: 'شركة الإبداع للتسويق',
    rating: 5,
    comment: 'خدمة ممتازة ونتائج فوق التوقعات. زادت مشاهدات بروفايلي على LinkedIn بنسبة 400% وحصلت على عروض عمل متعددة.',
    image: '👩‍💼'
  },
  {
    name: 'محمد الأحمد',
    position: 'محاسب قانوني',
    company: 'مكتب المحاسبة المتميز',
    rating: 5,
    comment: 'كان لدي خبرة 5 سنوات لكن سيرتي الذاتية لم تعكس ذلك. بعد التعامل مع بروفايل، أصبحت أحصل على مقابلات أكثر بثلاث مرات.',
    image: '👨‍💼'
  },
  {
    name: 'نورا العتيبي',
    position: 'مصممة جرافيك',
    company: 'استوديو الإبداع الرقمي',
    rating: 5,
    comment: 'ساعدوني في بناء معرض أعمال رقمي رائع وحسنوا من ظهوري على منصات التواصل المهني. النتيجة كانت مذهلة!',
    image: '👩‍🎨'
  },
  {
    name: 'خالد الراشد',
    position: 'طبيب عام',
    company: 'مستشفى الملك فيصل',
    rating: 5,
    comment: 'كنت أبحث عن وظيفة في المجال الطبي لمدة 8 أشهر بدون نتيجة. بعد أسبوعين من تحديث بروفايلي معهم، حصلت على 3 عروض عمل.',
    image: '👨‍⚕️'
  },
  {
    name: 'ريم الدوسري',
    position: 'محامية',
    company: 'مكتب الاستشارات القانونية',
    rating: 5,
    comment: 'الفريق محترف جداً ويهتم بأدق التفاصيل. ساعدوني في إبراز خبرتي القانونية بطريقة احترافية جذبت انتباه أكبر المكاتب.',
    image: '👩‍⚖️'
  }
]

const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl h-full"
  >
    <div className="relative">
      <FaQuoteRight className="absolute top-0 right-0 text-primary-200 text-2xl" />
      
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl">{testimonial.image}</div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
          <p className="text-primary-600 font-medium">{testimonial.position}</p>
          <p className="text-gray-500 text-sm">{testimonial.company}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <FaStar key={i} className="text-yellow-400 text-sm" />
        ))}
      </div>

      <p className="text-gray-600 leading-relaxed italic">
        "{testimonial.comment}"
      </p>
    </div>
  </motion.div>
)

export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlay])

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ماذا يقول عملاؤنا؟
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            قصص نجاح حقيقية من عملاء حققوا أهدافهم المهنية معنا
          </p>
        </motion.div>

        {/* Desktop view - Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Mobile/Tablet view - Slider */}
        <div className="lg:hidden">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {testimonials.slice(currentSlide * 2, (currentSlide * 2) + 2).map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>

          {/* Slider controls */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index)
                  setIsAutoPlay(false)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">⭐ 4.9/5</div>
                <p className="text-gray-600">تقييم العملاء</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">🏆 98%</div>
                <p className="text-gray-600">معدل الرضا</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">🚀 +5000</div>
                <p className="text-gray-600">قصة نجاح</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
