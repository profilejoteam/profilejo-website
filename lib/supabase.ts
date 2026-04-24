import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ricchlvljcyuojbjqhim.supabase.co'
// Fallback prevents createClient from throwing during Next.js static build when env vars are absent.
// Real key must be set via NEXT_PUBLIC_SUPABASE_ANON_KEY in production/Netlify env vars.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-time-placeholder-key'

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
