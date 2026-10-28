import { useCharacter } from '../context/CharacterContext'
import { Passive } from '../types/passive'
import { Actions, Card } from './ui'

export default function PassiveCard({ p, onEdit }: { p: Passive; onEdit: () => void }) {
  const { remove } = useCharacter()
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-bold text-amber-400">🩶 {p.name}</h3>
        <Actions onEdit={onEdit} onDelete={() => remove('passives', p.id)} />
      </div>
      <p className="text-xs text-purple-300">{p.category} • {p.active ? 'Ativa' : 'Passiva'}</p>
      <p className="mt-2 text-sm text-zinc-300 whitespace-pre-line">{p.description}</p>
      {p.notes && <p className="mt-2 text-xs text-zinc-400 whitespace-pre-line">Obs.: {p.notes}</p>}
    </Card>
  )
}
