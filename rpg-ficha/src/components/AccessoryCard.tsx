import { useCharacter } from '../context/CharacterContext'
import { Accessory, equipmentIcon } from '../types/accessory'
import { Actions, Card } from './ui'

export default function AccessoryCard({ a, onEdit }: { a: Accessory; onEdit: () => void }) {
  const { remove } = useCharacter()
  // Cada linha do campo "resistências" vira um chip
  const res = a.resistances.split('\n').map(r => r.trim()).filter(Boolean)
  return (
    <Card>
      {/* object-contain mostra o equipamento inteiro, sem cortar */}
      {a.image && <img src={a.image} alt={a.name} className="mb-3 h-40 w-full rounded-xl bg-zinc-950 object-contain" />}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-bold text-amber-400">{equipmentIcon(a.type)} {a.name}</h3>
        <Actions onEdit={onEdit} onDelete={() => remove('accessories', a.id)} />
      </div>
      <p className="text-xs text-purple-300">Tipo: {a.type}</p>
      <p className="mt-2 text-sm text-zinc-300">{a.description}</p>
      {a.bonus && <p className="mt-2 text-xs text-zinc-400"><b className="text-zinc-300">Bônus:</b> {a.bonus}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {res.map(r => <span key={r} className="rounded-full border border-blue-400/60 px-2 py-0.5 text-xs text-blue-300">{r}</span>)}
      </div>
    </Card>
  )
}
