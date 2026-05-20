import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yzwbwbrbogxblgpomlpj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2J3YnJib2d4YmxncG9tbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTE5NzIsImV4cCI6MjA5NDc2Nzk3Mn0.1geyi1DAMc_B8IX5VsgN2ZyORHthRUifcCRT2fNFN_g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
