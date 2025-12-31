import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qacyhorahybirrismbmv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhY3lob3JhaHliaXJyaXNtYm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzE4MzUsImV4cCI6MjA4MTM0NzgzNX0.xCjzpoGIho3xXLN6IoIQd0_PogXM4tPJMKASymgtJSs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
