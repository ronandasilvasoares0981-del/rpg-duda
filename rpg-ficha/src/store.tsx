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

// userId = dono da ficha. Sempre filtramos por ele: o mestre enxerga todas as linhas, então não dá para confiar só no RLS.
export function SheetProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [sheet, setSheet] = useState<Sheet>(defaultSheet)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const dirty = useRef(false)

  // Carrega a ficha do dono (userId)
  useEffect(() => {
    supabase.from('rpg_fichas').select('data').eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (error) { setError(error.message); setStatus('error'); return }
      if (data?.data) setSheet(mergeSheet(data.data as Partial<Sheet>))
      setLoaded(true); setStatus('saved')
    })
  }, [userId])

  const update = useCallback((fn: (s: Sheet) => Sheet) => {
    dirty.current = true
    setStatus('dirty')
    setSheet(fn)
  }, [])

  // Grava a ficha no banco. Ficha própria: cria ou atualiza (e guarda o e-mail).
  // Ficha de outro player (mestre): só atualiza a linha que já existe.
  const persist = useCallback(async (s: Sheet) => {
    const { data: { user } } = await supabase.auth.getUser()
    const now = new Date().toISOString()
    return user!.id === userId
      ? await supabase.from('rpg_fichas').upsert({ user_id: userId, data: s, email: user!.email, updated_at: now })
      : await supabase.from('rpg_fichas').update({ data: s, updated_at: now }).eq('user_id', userId)
  }, [userId])

  // Salva depois de uma pausa na digitação
  useEffect(() => {
    if (!dirty.current || !loaded) return
    const t = setTimeout(async () => {
      dirty.current = false
      setStatus('saving')
      const { error } = await persist(sheet)
      if (error) { dirty.current = true; setError(error.message); setStatus('error') }
      else if (!dirty.current) setStatus('saved')
    }, 800)
    return () => clearTimeout(t)
  }, [sheet, loaded, persist])

  // Ao sair da ficha (ex.: botão "Voltar" do mestre) com algo ainda pendente, salva na hora
  const latest = useRef(sheet)
  latest.current = sheet
  useEffect(() => () => { if (dirty.current) { dirty.current = false; void persist(latest.current) } }, [persist])

  return <SheetCtx.Provider value={{ sheet, update, status, error, loaded }}>{children}</SheetCtx.Provider>
}
