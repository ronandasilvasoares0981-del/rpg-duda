import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { newPassive, Passive } from '../types/passive'
import PassiveCard from '../components/PassiveCard'
import PassiveModal from '../components/PassiveModal'
import { btnCls, inputCls } from '../components/ui'

export default function Passivas() {
  const { state } = useCharacter()
  const [q, setQ] = useState('')                               // texto da pesquisa
  const [editing, setEditing] = useState<Passive | null>(null)
  // Pesquisa por nome ou categoria + ordenação numérica pelo nome (01, 02… 10… L1, L2)
  const list = state.passives
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt', { numeric: true }))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-amber-400">🩶 Passivas</h2>
        <button className={btnCls} onClick={() => setEditing(newPassive())}><Plus size={16} /> Adicionar Passiva</button>
      </div>
      <input className={inputCls} placeholder="Pesquisar passiva" value={q} onChange={e => setQ(e.target.value)} />
      {list.length === 0 && <p className="text-zinc-500">Nenhuma passiva encontrada. Clique em "Adicionar Passiva" para começar.</p>}
      <div className="grid gap-3 md:grid-cols-2">{list.map(p => <PassiveCard key={p.id} p={p} onEdit={() => setEditing(p)} />)}</div>
      {editing && <PassiveModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
