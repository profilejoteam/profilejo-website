'use client'

import { motion } from 'framer-motion'
import { FaRocket, FaShieldAlt, FaClock, FaUsers, FaChartLine, FaHeart } from 'react-icons/fa'

const features = [
  {
    icon: FaRocket,
    title: 'سرعة في التنفيذ',
    description: 'نضمن تسليم بروفايلك المهني خلال 7 أيام عمل كحد أقصى',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FaShieldAlt,
    title: 'جودة مضمونة',
    description: 'فريق من الخبراء يضمن أعلى معايير الجودة والاحترافية',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaClock,
    title: 'متابعة مستمرة',
    description: 'دعم ومتابعة لمدة 3 أشهر بعد التسليم لضمان نجاحك',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: FaUsers,
    title: 'فريق متخصص',
    description: 'خبراء في التوظيف وتطوير المهن مع سنوات من الخبرة',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: FaChartLine,
    title: 'نتائج مثبتة',
    description: 'زيادة فرص الحصول على مقابلات بنسبة 300% في المتوسط',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: FaHeart,
    title: 'رضا العملاء',
    description: '98% من عملائنا راضون عن الخدمة ويوصون بها للآخرين',
    color: 'from-pink-500 to-rose-500'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            لماذا تختار بروفايل؟
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نجمع بين الخبرة والإبداع لنقدم لك خدمة متميزة تضعك في المقدمة
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl h-full">
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} p-1 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-white/90 rounded-xl flex items-center justify-center">
                      <feature.icon className="text-2xl text-gray-700" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-center">
                  {feature.description}
                </p>

                <div className="mt-6 flex justify-center">
                  <div className={`w-12 h-1 bg-gradient-to-r ${feature.color} rounded-full`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              مستعد لبناء مستقبلك المهني؟
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              انضم إلى آلاف العملاء الذين حققوا أهدافهم المهنية معنا
            </p>
            <a href="/auth" className="btn-primary text-lg px-8 py-4 inline-block">
              ابدأ رحلتك الآن
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
