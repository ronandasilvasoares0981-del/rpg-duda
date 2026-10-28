import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { Magic, newMagic } from '../types/magic'
import MagicCard from '../components/MagicCard'
import MagicModal from '../components/MagicModal'
import { btnCls, inputCls } from '../components/ui'

export default function Magias() {
  const { state } = useCharacter()
  const [q, setQ] = useState('')                       // texto da pesquisa
  const [el, setEl] = useState('')                     // filtro de elemento
  const [tp, setTp] = useState('')                     // filtro de tipo
  const [editing, setEditing] = useState<Magic | null>(null) // magia aberta no modal (null = fechado)
  const types = [...new Set(state.magics.map(m => m.type).filter(Boolean))]
  // Pesquisa + filtros + ordenação numérica pelo nome (1, 2… 10)
  const list = state.magics
    .filter(m => m.name.toLowerCase().includes(q.toLowerCase()) && (!el || m.element === el) && (!tp || m.type === tp))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt', { numeric: true }))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-amber-400">✨ Grimório</h2>
        <button className={btnCls} onClick={() => setEditing(newMagic())}><Plus size={16} /> Nova Magia</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input className={inputCls} placeholder="Pesquisar magia" value={q} onChange={e => setQ(e.target.value)} />
        <select className={inputCls} value={el} onChange={e => setEl(e.target.value)}>
          <option value="">Todos os elementos</option>
          {state.elementDefs.map(d => <option key={d.name}>{d.name}</option>)}
        </select>
        <select className={inputCls} value={tp} onChange={e => setTp(e.target.value)}>
          <option value="">Todos os tipos</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      {list.length === 0 && <p className="text-zinc-500">Nenhuma magia encontrada. Clique em "Nova Magia" para começar.</p>}
      <div className="grid gap-3 md:grid-cols-2">{list.map(m => <MagicCard key={m.id} m={m} onEdit={() => setEditing(m)} />)}</div>
      {editing && <MagicModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
