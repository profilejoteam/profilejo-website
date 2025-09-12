import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTM0MTEsImV4cCI6MjA3MzI2OTQxMX0.r97UcFzcHgjdaNWlMx5fcXTKtAcNXVUFn7ycwJQLSt4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
