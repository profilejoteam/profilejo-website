'use client'

import { motion } from 'framer-motion'
import { FaUser, FaFileAlt, FaLinkedin, FaBriefcase, FaGraduationCap, FaStar } from 'react-icons/fa'

const services = [
  {
    icon: FaUser,
    title: 'إنشاء بروفايل شخصي',
    description: 'نساعدك في بناء هوية شخصية قوية تعكس شخصيتك ومهاراتك بطريقة مهنية واحترافية',
    features: ['تصميم مخصص', 'محتوى احترافي', 'تحسين للبحث']
  },
  {
    icon: FaFileAlt,
    title: 'كتابة السيرة الذاتية',
    description: 'سيرة ذاتية احترافية تبرز خبراتك ومهاراتك بطريقة تجذب أصحاب العمل وتزيد فرص قبولك',
    features: ['قوالب حديثة', 'محتوى مخصص', 'تنسيق احترافي']
  },
  {
    icon: FaLinkedin,
    title: 'تحسين LinkedIn',
    description: 'تطوير وتحسين بروفايل LinkedIn الخاص بك لجذب المزيد من الفرص المهنية والشبكات',
    features: ['تحسين العنوان', 'كتابة الوصف', 'استراتيجية المحتوى']
  },
  {
    icon: FaBriefcase,
    title: 'استراتيجية البحث عن عمل',
    description: 'خطة شاملة للبحث عن الوظيفة المناسبة مع نصائح حول المقابلات والتفاوض',
    features: ['خطة مخصصة', 'تدريب المقابلات', 'نصائح التفاوض']
  },
  {
    icon: FaGraduationCap,
    title: 'تطوير المهارات',
    description: 'تحديد المهارات المطلوبة في سوق العمل ووضع خطة لتطويرها وإبرازها',
    features: ['تقييم المهارات', 'خطة التطوير', 'شهادات معتمدة']
  },
  {
    icon: FaStar,
    title: 'بناء العلامة الشخصية',
    description: 'تطوير علامتك الشخصية على المنصات المختلفة لتصبح مرجعاً في مجال تخصصك',
    features: ['استراتيجية المحتوى', 'إدارة الحسابات', 'بناء الشبكة']
  }
]

export default function ServicesSection() {
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
            خدماتنا المتكاملة
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نقدم مجموعة شاملة من الخدمات المهنية لمساعدتك في بناء مستقبل مهني مشرق ومتميز
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl group"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full bg-gray-50 text-primary-600 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-300 hover:bg-primary-50 hover:border-primary-200 group-hover:bg-primary-500 group-hover:text-white">
                  اعرف أكثر
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
