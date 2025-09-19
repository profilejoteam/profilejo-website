'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaUser, FaHome, FaQuestionCircle, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<any>
}

const navItems: NavItem[] = [
  { label: 'الرئيسية', href: '/', icon: FaHome },
  { label: 'النموذج', href: '/form', icon: FaUser },
  { label: 'الأسئلة الشائعة', href: '/#faq', icon: FaQuestionCircle },
  { label: 'تواصل معنا', href: '/#contact', icon: FaEnvelope },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Get current user and session
    const getUser = async () => {
      try {
        // أولاً: محاولة الحصول على الـ session المحفوظة
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        
        // إذا لم توجد session، تحقق من الـ user مباشرة
        if (!session?.user) {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        }
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      }
    }
    
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else {
        // للأحداث الأخرى، تحقق من الـ user مرة أخرى
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    
    if (href.startsWith('/#')) {
      // Handle anchor links
      if (pathname !== '/') {
        router.push('/')
        setTimeout(() => {
          const element = document.querySelector(href.substring(1))
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      } else {
        const element = document.querySelector(href.substring(1))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    } else {
      router.push(href)
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-xl border-b border-gray-200' 
          : 'bg-gray-900/95 backdrop-blur-md shadow-lg'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20"
            >
              <span className="text-white font-bold text-xl">ب</span>
            </motion.div>
            <motion.h1
              whileHover={{ x: 5 }}
              className={`text-2xl font-bold transition-colors duration-300 ${
                scrolled ? 'text-gray-900' : 'text-white'
              } group-hover:text-primary-500`}
            >
              بروفايل
            </motion.h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.href}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item.href)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-primary-500 text-white shadow-lg'
                    : scrolled
                      ? 'text-gray-800 hover:text-primary-600 hover:bg-primary-50'
                      : 'text-white hover:text-primary-300 hover:bg-white/20'
                }`}
              >
                <item.icon className="text-sm" />
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* CTA Button or User Info */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/admin" className={`text-sm font-medium px-3 py-1 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                    : 'text-blue-300 hover:text-white hover:bg-blue-500/20'
                }`}>
                  ⚙️ لوحة الإدارة
                </Link>
                <span className={`text-sm font-medium ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}>
                  مرحباً، {user.email?.split('@')[0]}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    scrolled 
                      ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                      : 'text-red-300 hover:text-white hover:bg-red-500/20'
                  }`}
                >
                  <FaSignOutAlt />
                  خروج
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/form')}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ابدأ الآن
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-3 rounded-xl transition-all duration-300 ${
              scrolled 
                ? 'text-gray-800 hover:bg-gray-100 border border-gray-200' 
                : 'text-white hover:bg-white/20 border border-white/30'
            }`}
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
            >
              <div className="py-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-right transition-all duration-300 ${
                      pathname === item.href
                        ? 'bg-primary-500 text-white border-r-4 border-primary-600 font-bold'
                        : 'text-gray-800 hover:bg-primary-50 hover:text-primary-600 font-medium'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
                
                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="px-6 pt-4 border-t-2 border-gray-200 mt-4"
                >
                  {user ? (
                    <div className="space-y-3">
                      <div className="text-center text-sm text-gray-700 font-medium mb-3 bg-gray-50 py-2 rounded-lg">
                        مرحباً، {user.email?.split('@')[0]}
                      </div>
                      
                      {/* Admin Button for Mobile */}
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          router.push('/admin')
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all duration-300"
                      >
                        <FaCog />
                        لوحة الإدارة
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all duration-300"
                      >
                        <FaSignOutAlt />
                        تسجيل الخروج
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        router.push('/form')
                      }}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      ابدأ الآن
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}