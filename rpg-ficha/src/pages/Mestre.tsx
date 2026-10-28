// Telas do mestre: painel de escolha e lista de fichas dos players
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Crown, Search, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Sheet, mergeSheet } from '../types'
import { Card } from '../components/ui'

const Topo = ({ children }: { children?: ReactNode }) => (
  <header className="flex h-16 items-center gap-3 border-b border-purple-500/30 bg-zinc-950 px-4">
    <span className="text-lg font-bold tracking-wide text-amber-400 sm:text-xl">📖 RPG DUDA</span>
    <span className="rounded bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">👑 Mestre</span>
    <div className="ml-auto">{children}</div>
  </header>
)

// Painel inicial: escolher entre a própria ficha e as fichas dos players
export function Painel({ onOwn, onPlayers }: { onOwn: () => void; onPlayers: () => void }) {
  const opt = 'group flex flex-col items-center gap-3 rounded-2xl border border-purple-500/30 bg-zinc-900 p-8 text-center transition hover:border-amber-400 hover:bg-zinc-800'
  return (
    <div className="flex min-h-screen flex-col">
      <Topo><button className="text-sm text-zinc-400 hover:text-amber-400" onClick={() => supabase.auth.signOut()}>Sair</button></Topo>
      <main className="mx-auto grid w-full max-w-3xl flex-1 content-center gap-6 p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400">Painel do Mestre</h1>
          <p className="mt-1 text-zinc-400">O que você quer acessar?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button className={opt} onClick={onOwn}>
            <Crown size={40} className="text-amber-400" />
            <span className="text-xl font-bold text-amber-300">Minha ficha</span>
            <span className="text-sm text-zinc-400">Abrir a ficha do seu personagem</span>
          </button>
          <button className={opt} onClick={onPlayers}>
            <Users size={40} className="text-amber-400" />
            <span className="text-xl font-bold text-amber-300">Fichas dos players</span>
            <span className="text-sm text-zinc-400">Ver e editar a ficha de qualquer jogador</span>
          </button>
        </div>
      </main>
    </div>
  )
}

interface Row { user_id: string; email: string | null; updated_at: string; data: Partial<Sheet> | null }

// Lista com todas as fichas (menos a do próprio mestre), com busca por nome, raça, classe ou e-mail
export function ListaPlayers({ myId, onBack, onOpen }: { myId: string; onBack: () => void; onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    supabase.from('rpg_fichas').select('user_id, email, updated_at, data').neq('user_id', myId).order('updated_at', { ascending: false })
      .then(({ data, error }) => { if (error) setErr(error.message); else setRows((data ?? []) as Row[]) })
  }, [myId])

  const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const shown = useMemo(() => {
    const k = norm(q.trim())
    return (rows ?? []).map(r => ({ ...r, s: mergeSheet(r.data ?? {}) }))
      .filter(r => !k || norm([r.s.player, r.s.name, r.s.race, r.s.klass, r.email ?? ''].join(' ')).includes(k))
  }, [rows, q])

  return (
    <div className="flex min-h-screen flex-col">
      <Topo>
        <button onClick={onBack} className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-900">
          <ArrowLeft size={16} />Voltar
        </button>
      </Topo>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">👥 Fichas dos players</h1>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="search" aria-label="Pesquisar players" placeholder="Pesquisar por player, personagem…" value={q} onChange={e => setQ(e.target.value)}
              className="w-full rounded-full border border-purple-500/30 bg-zinc-900 py-2 pl-9 pr-3 text-base text-zinc-100 outline-none transition focus:border-amber-400 sm:text-sm" />
          </div>
        </div>

        {err && <Card><p className="text-red-300">Não foi possível carregar as fichas: {err}</p>
          <p className="mt-1 text-sm text-zinc-400">Confira se o bloco “MODO MESTRE” do <code>supabase.sql</code> foi executado.</p></Card>}
        {!err && rows === null && <p className="text-zinc-400">Carregando fichas…</p>}
        {rows && shown.length === 0 && (
          <Card><p className="text-zinc-400">{rows.length === 0 ? 'Nenhum player criou uma ficha ainda.' : 'Nenhuma ficha encontrada para essa pesquisa.'}</p></Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ user_id, email, updated_at, s }) => (
            <button key={user_id} onClick={() => onOpen(user_id)}
              className="fade flex items-center gap-4 rounded-2xl border border-purple-500/30 bg-zinc-900 p-4 text-left transition hover:border-amber-400 hover:bg-zinc-800">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-amber-400/40 bg-zinc-800">
                {/^(https?:|data:image)/.test(s.image) && <img src={s.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-amber-300">{s.name || 'Sem nome'}</p>
                <p className="truncate text-sm text-zinc-300">{[s.level ? `Nível ${s.level}` : '', s.race, s.klass].filter(Boolean).join(' • ') || 'Ficha em branco'}</p>
                <p className="truncate text-sm text-zinc-400">Player: {s.player || '—'}</p>
                {email && <p className="truncate text-xs text-zinc-500">{email}</p>}
                <p className="text-xs text-zinc-500">Atualizada em {new Date(updated_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
