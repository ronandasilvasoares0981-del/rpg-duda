import { createClient } from '@supabase/supabase-js'

// Cliente único do Supabase, configurado pelo arquivo .env (ou pelas variáveis da Vercel)
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// Bucket do Storage onde ficam as fotos do personagem e dos aliados
export const BUCKET = 'rpg-fotos'
