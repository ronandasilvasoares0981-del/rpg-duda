import { createClient } from '@supabase/supabase-js'

// Cliente único do Supabase, configurado pelo arquivo .env (veja .env.example)
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// false = o .env não existe ou está incompleto (o main.tsx mostra um aviso em vez de uma tela branca)
export const envOk = Boolean(url && key)

// Valores falsos só para o createClient não lançar erro quando o .env está faltando
export const supabase = createClient(url || 'https://sem-env.supabase.co', key || 'sem-env')
