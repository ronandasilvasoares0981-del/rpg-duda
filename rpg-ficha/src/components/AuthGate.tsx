import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { btnCls, Card, inputCls } from './ui'

// Só mostra o site para quem estiver logado; cada pessoa vê apenas a própria ficha
export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = carregando
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [msg, setMsg] = useState('')

  // Descobre se já há login salvo e acompanha entradas e saídas
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <p className="p-8 text-zinc-400">Carregando…</p>
  if (session) return <>{children}</>

  const entrar = async (novo: boolean) => {
    const cred = { email, password: pass }
    const { error } = novo ? await supabase.auth.signUp(cred) : await supabase.auth.signInWithPassword(cred)
    setMsg(error ? error.message : novo ? 'Conta criada. Se o Supabase pedir confirmação, veja seu e-mail.' : '')
  }
  const submit = (e: FormEvent) => { e.preventDefault(); entrar(false) }
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm">
        <form className="space-y-3" onSubmit={submit}>
          <h1 className="text-3xl font-bold text-amber-400">📖 RPG DUDA</h1>
          <input className={inputCls} type="email" autoComplete="username" aria-label="E-mail" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input className={inputCls} type="password" autoComplete="current-password" aria-label="Senha" placeholder="Senha (mínimo 6 caracteres)" value={pass} onChange={e => setPass(e.target.value)} />
          {msg && <p className="text-sm text-amber-300">{msg}</p>}
          <div className="flex gap-2">
            <button type="submit" className={btnCls}>Entrar</button>
            <button type="button" className="rounded-lg border border-purple-500/40 px-4 py-2 hover:bg-zinc-800" onClick={() => entrar(true)}>Criar conta</button>
          </div>
        </form>
      </Card>
    </div>
  )
}
