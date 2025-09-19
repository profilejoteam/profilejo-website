'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // الحصول على الـ session الحالية
    const getInitialSession = async () => {
      try {
        setLoading(true)
        
        // محاولة الحصول على الـ session المحفوظة أولاً
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
        } else if (session) {
          setSession(session)
          setUser(session.user)
          console.log('Session restored for user:', session.user.email)
        } else {
          // إذا لم توجد session، تحقق من الـ user مباشرة
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
          console.log('No session found, user check result:', user?.email || 'no user')
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // الاستماع لتغييرات الـ authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
      
      // حفظ معلومات إضافية في الـ localStorage للاسترجاع السريع
      if (session?.user) {
        localStorage.setItem('profilejo-user-info', JSON.stringify({
          email: session.user.email,
          id: session.user.id,
          lastLogin: Date.now()
        }))
      } else {
        localStorage.removeItem('profilejo-user-info')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      } else {
        setUser(null)
        setSession(null)
        localStorage.removeItem('profilejo-user-info')
        router.push('/auth')
      }
    } catch (error) {
      console.error('Error in signOut:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
      } else {
        setSession(session)
        setUser(session?.user || null)
        console.log('Session refreshed for user:', session?.user?.email)
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
    refreshSession,
    isAuthenticated: !!user
  }
}
