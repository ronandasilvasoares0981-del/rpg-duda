import { useState } from 'react'
import Ficha from './pages/Ficha'
import Status from './pages/Status'
import Magias from './pages/Magias'
import Passivas from './pages/Passivas'
import Acessorios from './pages/Acessorios'
import Config from './pages/Config'

// Para criar uma nova aba: crie a página em src/pages e adicione uma linha aqui
const TABS = [
  { id: 'ficha', label: '📖 Ficha', Page: Ficha },
  { id: 'status', label: '📊 Status', Page: Status },
  { id: 'magias', label: '✨ Magias', Page: Magias },
  { id: 'passivas', label: '🩶 Passivas', Page: Passivas },
  { id: 'acessorios', label: '⚔️ Equipamentos', Page: Acessorios },
  { id: 'config', label: '⚙️ Configurações', Page: Config },
]

export default function App() {
  const [tab, setTab] = useState('ficha')
  const { Page } = TABS.find(t => t.id === tab)!
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Menu lateral (vira barra horizontal no celular) */}
      <nav className="flex gap-1 overflow-x-auto border-b border-purple-500/30 bg-zinc-950 p-2 md:w-56 md:flex-col md:border-b-0 md:border-r md:p-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-left transition ${tab === t.id ? 'bg-purple-700 text-amber-300' : 'text-zinc-400 hover:bg-zinc-900'}`}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8"><Page /></main>
    </div>
  )
}
