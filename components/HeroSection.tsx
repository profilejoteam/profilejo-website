'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FaLinkedin, FaInstagram, FaTiktok, FaFacebook, FaWhatsapp } from 'react-icons/fa'

const FloatingShape = ({ size, color, delay, x, y }: {
  size: string
  color: string
  delay: number
  x: string
  y: string
}) => (
  <motion.div
    className={`floating-shape ${size} ${color}`}
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.2, scale: 1 }}
    transition={{ delay, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
  />
)

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }
    }, delay + currentIndex * 100)

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay])

  return (
    <span className="border-l-2 border-secondary-400 pl-2">
      {displayText}
    </span>
  )
}

const SocialMediaBar = () => {
  const socialLinks = [
    { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600 hover:bg-blue-50' },
    { icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600 hover:bg-pink-50' },
    { icon: FaTiktok, href: '#', label: 'TikTok', color: 'hover:text-gray-800 hover:bg-gray-50' },
    { icon: FaFacebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600 hover:bg-blue-50' },
    { icon: FaWhatsapp, href: '#', label: 'WhatsApp', color: 'hover:text-green-600 hover:bg-green-50' },
  ]

  return (
    <motion.div
      className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.label}
          href={social.href}
          className={`social-icon group ${social.color}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={social.label}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 + index * 0.1 }}
        >
          <social.icon />
          <div className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            {social.label}
          </div>
        </motion.a>
      ))}
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-200 rounded-full opacity-40 blur-2xl"></div>
      </div>

      {/* Social Media Bar */}
      <SocialMediaBar />

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-right"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
              <img 
                src="../logo+.png" 
                alt="بروفايل" 
                className="w-16 h-16 md:w-20 md:h-20"
              />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                بروفايل
              </h1>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            هوية مهنية كاملة 
            <span className="text-primary-600"> تجهزك </span>
            لسوق العمل
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed"
          >
            نساعدك في بناء سيرة ذاتية احترافية وبروفايل LinkedIn قوي يضعك في المقدمة
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <a
              href="/auth"
              className="btn-primary text-lg px-8 py-4 inline-block text-center"
            >
              ابدأ الآن مجاناً
            </a>
            <button className="btn-secondary text-lg px-8 py-4">
              شاهد أعمالنا
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex items-center justify-center lg:justify-start gap-8 mt-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span>4.9/5 تقييم</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span>+5000 عميل</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span>98% نجاح</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content - Illustration/Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative"
        >
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            {/* Placeholder for professional illustration */}
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center text-8xl">
              💼
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg border border-gray-200"
            >
              <span className="text-2xl">📄</span>
            </motion.div>
            
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg border border-gray-200"
            >
              <span className="text-2xl">💻</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-primary-300 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-primary-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
