import { useState } from 'react'
import { supabase } from './lib/supabase'
import { Status, useSheet } from './store'
import Ficha from './pages/Ficha'
import EntryPage from './pages/EntryPage'
import Aliados from './pages/Aliados'
import Lore from './pages/Lore'

// Para criar uma nova aba: crie a página em src/pages e adicione uma linha aqui
const TABS = [
  { id: 'ficha', label: '📖 Ficha', Page: Ficha },
  { id: 'equip', label: '🛡️ Equipamentos', Page: () => (
    <EntryPage field="equipment" title="Equipamentos" icon="🛡️" tagLabel="Slot" tagHint="Ex.: mão direita, corpo"
      newLabel="Novo equipamento" empty="Nenhum equipamento registrado ainda." /> ) },
  { id: 'magias', label: '✨ Magias', Page: () => (
    <EntryPage field="spells" title="Magias" icon="✨" tagLabel="Custo" tagHint="Ex.: 20 MP"
      newLabel="Nova magia" empty="Nenhuma magia registrada ainda." /> ) },
  { id: 'passivas', label: '🩶 Passivas', Page: () => (
    <EntryPage field="passives" title="Passivas" icon="🩶" tagLabel="Tipo" tagHint="Ex.: skill única, passiva"
      newLabel="Nova passiva" empty="Nenhuma passiva registrada ainda." /> ) },
  { id: 'aliados', label: '🤝 Aliados', Page: Aliados },
  { id: 'lore', label: '📜 Lore', Page: Lore },
]

const STATUS_TEXT: Record<Status, string> = {
  loading: 'Carregando…', saved: 'Salvo na nuvem', dirty: 'Alterações pendentes…', saving: 'Salvando…', error: 'Erro ao salvar',
}

export default function App() {
  const [tab, setTab] = useState('ficha')
  const { status, error, loaded } = useSheet()
  const { Page } = TABS.find(t => t.id === tab)!

  // Se a ficha não carregou (ex.: o SQL ainda não foi executado), não deixa editar para não perder dados
  if (status === 'loading') return <p className="p-8 text-zinc-400">Carregando ficha…</p>
  if (!loaded) return (
    <div className="mx-auto max-w-xl space-y-3 p-8">
      <h1 className="text-2xl font-bold text-amber-400">Não foi possível carregar a ficha</h1>
      <p className="text-red-300">{error}</p>
      <p className="text-zinc-400">Confira se o arquivo <code>supabase.sql</code> foi executado no SQL Editor do Supabase.</p>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Menu lateral (vira barra horizontal no celular) */}
      <nav className="flex items-center gap-1 overflow-x-auto border-b border-purple-500/30 bg-zinc-950 p-2 md:w-56 md:flex-col md:items-stretch md:border-b-0 md:border-r md:p-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-left transition ${tab === t.id ? 'bg-purple-700 text-amber-300' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 whitespace-nowrap pl-3 text-xs md:ml-0 md:mt-auto md:flex-col md:items-start md:gap-1 md:pl-0 md:pt-4" role="status">
          <span className={status === 'error' ? 'text-red-400' : 'text-zinc-500'}>{STATUS_TEXT[status]}</span>
          {status === 'error' && <span className="hidden text-red-300 md:block">{error}</span>}
          <button className="text-zinc-400 hover:text-amber-400" onClick={() => supabase.auth.signOut()}>Sair</button>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8"><Page /></main>
    </div>
  )
}
