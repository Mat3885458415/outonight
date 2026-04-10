import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tfakjdpbtahkdnzthelz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWtqZHBidGFoa2RuenRoZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzMxMDUsImV4cCI6MjA5MTMwOTEwNX0.ytbE5PQWY-EHeKRzHHLdVcLM3pmMm5Emz-7codNNsTs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: 'https://outonight.vercel.app'
  }
})