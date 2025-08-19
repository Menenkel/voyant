import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xohrysyuybcedcgiazon.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvaHJ5c3l1eWJjZWRjZ2lhem9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjYxODQsImV4cCI6MjA2NDIwMjE4NH0.eC8_1xVh2HQFsZNObw7CLfi8fnYxxkJOvt18nZM5Qto'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
