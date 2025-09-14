'use client'

import { motion } from 'framer-motion'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaLinkedin, FaInstagram, FaTiktok, FaFacebook, FaClock, FaHeadset } from 'react-icons/fa'

const contactInfo = [
  {
    icon: FaPhone,
    title: 'اتصل بنا',
    info: '+966 50 123 4567',
    description: 'متاح من 9 صباحاً إلى 9 مساءً',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FaWhatsapp,
    title: 'واتساب',
    info: '+966 50 123 4567',
    description: 'رد فوري على مدار الساعة',
    color: 'from-green-600 to-green-400'
  },
  {
    icon: FaEnvelope,
    title: 'البريد الإلكتروني',
    info: 'info@profile-sa.com',
    description: 'نرد خلال ساعة واحدة',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaHeadset,
    title: 'الدعم الفني',
    info: 'support@profile-sa.com',
    description: 'مساعدة تقنية متخصصة',
    color: 'from-purple-500 to-pink-500'
  }
]

const socialLinks = [
  { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-400' },
  { icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
  { icon: FaTiktok, href: '#', label: 'TikTok', color: 'hover:text-gray-800' },
  { icon: FaFacebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
]

const quickLinks = [
  'الصفحة الرئيسية',
  'خدماتنا',
  'معرض الأعمال',
  'قصص النجاح',
  'المدونة',
  'تواصل معنا'
]

const services = [
  'إنشاء السيرة الذاتية',
  'تحسين LinkedIn',
  'بناء العلامة الشخصية',
  'استشارات مهنية',
  'تدريب المقابلات',
  'البحث عن وظائف'
]

export default function ContactFooterSection() {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              تواصل معنا
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نحن هنا لمساعدتك في بناء مستقبلك المهني. تواصل معنا بأي طريقة تناسبك
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {contactInfo.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${contact.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <contact.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {contact.title}
                </h3>
                <p className="text-primary-600 font-medium mb-2">
                  {contact.info}
                </p>
                <p className="text-gray-500 text-sm">
                  {contact.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Quick contact section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    هل أنت مستعد للبدء؟
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    احجز استشارة مجانية الآن ودعنا نساعدك في بناء مستقبلك المهني
                  </p>
                  <div className="flex gap-4">
                    <FaClock className="text-orange-300 text-xl mt-1" />
                    <div>
                      <p className="text-white font-medium">ساعات العمل</p>
                      <p className="text-white/80">السبت - الخميس: 9:00 ص - 9:00 م</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <a href="/auth" className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg shadow-lg mb-4 w-full md:w-auto inline-block text-center">
                    احجز استشارة مجانية
                  </a>
                  <p className="text-white/70 text-sm">
                    أو اتصل بنا مباشرة على الرقم أعلاه
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto max-w-7xl px-6 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Logo and description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <h3 className="text-3xl font-bold text-white mb-4">بروفايل</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                نساعد الشباب العربي في بناء هوية مهنية قوية وتحقيق أهدافهم المهنية من خلال خدمات متخصصة وحلول مبتكرة.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors duration-300 hover:bg-primary-500`}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-xl font-bold text-white mb-6">روابط سريعة</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xl font-bold text-white mb-6">خدماتنا</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors duration-300">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-xl font-bold text-white mb-6">معلومات التواصل</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <FaMapMarkerAlt className="text-primary-400" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <FaPhone className="text-primary-400" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <FaEnvelope className="text-primary-400" />
                  <span>info@profile-sa.com</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-gray-800 mt-12 pt-8 text-center"
          >
            <p className="text-gray-500">
              © 2025 بروفايل. جميع الحقوق محفوظة. | 
              <a href="#" className="hover:text-primary-400 transition-colors duration-300 mx-2">سياسة الخصوصية</a> | 
              <a href="#" className="hover:text-primary-400 transition-colors duration-300 mx-2">شروط الاستخدام</a>
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  )
}
