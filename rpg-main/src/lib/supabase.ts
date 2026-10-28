import { createClient } from '@supabase/supabase-js'

// Cliente único do Supabase, configurado pelo arquivo .env
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
