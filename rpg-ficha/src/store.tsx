// Guarda a ficha inteira e salva sozinha no Supabase 0,8 s depois da última alteração
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import { Sheet, defaultSheet, mergeSheet } from './types'

export type Status = 'loading' | 'saved' | 'dirty' | 'saving' | 'error'
interface Ctx {
  sheet: Sheet
  update: (fn: (s: Sheet) => Sheet) => void
  status: Status
  error: string
  loaded: boolean
}
const SheetCtx = createContext<Ctx>(null as unknown as Ctx)
export const useSheet = () => useContext(SheetCtx)

export function SheetProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<Sheet>(defaultSheet)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const dirty = useRef(false)

  // Carrega a ficha do usuário logado (o RLS do banco só devolve a dele)
  useEffect(() => {
    supabase.from('rpg_fichas').select('data').maybeSingle().then(({ data, error }) => {
      if (error) { setError(error.message); setStatus('error'); return }
      if (data?.data) setSheet(mergeSheet(data.data as Partial<Sheet>))
      setLoaded(true); setStatus('saved')
    })
  }, [])

  const update = useCallback((fn: (s: Sheet) => Sheet) => {
    dirty.current = true
    setStatus('dirty')
    setSheet(fn)
  }, [])

  // Salva depois de uma pausa na digitação
  useEffect(() => {
    if (!dirty.current || !loaded) return
    const t = setTimeout(async () => {
      dirty.current = false
      setStatus('saving')
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('rpg_fichas')
        .upsert({ user_id: user!.id, data: sheet, updated_at: new Date().toISOString() })
      if (error) { dirty.current = true; setError(error.message); setStatus('error') }
      else if (!dirty.current) setStatus('saved')
    }, 800)
    return () => clearTimeout(t)
  }, [sheet, loaded])

  return <SheetCtx.Provider value={{ sheet, update, status, error, loaded }}>{children}</SheetCtx.Provider>
}
