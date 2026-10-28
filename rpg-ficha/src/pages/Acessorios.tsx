import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { Accessory, newAccessory } from '../types/accessory'
import AccessoryCard from '../components/AccessoryCard'
import AccessoryModal from '../components/AccessoryModal'
import { btnCls } from '../components/ui'

export default function Acessorios() {
  const { state } = useCharacter()
  const [editing, setEditing] = useState<Accessory | null>(null)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-amber-400">⚔️ Equipamentos</h2>
        <button className={btnCls} onClick={() => setEditing(newAccessory())}><Plus size={16} /> Novo Equipamento</button>
      </div>
      {state.accessories.length === 0 && <p className="text-zinc-500">Nenhum equipamento ainda. Adicione a primeira armadura, arma ou acessório.</p>}
      <div className="grid gap-3 md:grid-cols-2">{state.accessories.map(a => <AccessoryCard key={a.id} a={a} onEdit={() => setEditing(a)} />)}</div>
      {editing && <AccessoryModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
