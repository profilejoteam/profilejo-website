import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ricchlvljcyuojbjqhim.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // حفظ الـ session في localStorage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'profilejo-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
