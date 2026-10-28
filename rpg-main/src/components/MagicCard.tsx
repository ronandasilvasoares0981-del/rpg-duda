import { useCharacter } from '../context/CharacterContext'
import { Magic } from '../types/magic'
import { Actions, Card } from './ui'

export default function MagicCard({ m, onEdit }: { m: Magic; onEdit: () => void }) {
  const { state, remove } = useCharacter()
  const icon = state.elementDefs.find(d => d.name === m.element)?.icon
  const details = [['Alcance', m.range], ['Duração', m.duration], ['Cooldown', m.cooldown], ['Efeitos', m.effects], ['Penalidade', m.penalty]]
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-bold text-amber-400">{icon} {m.name}</h3>
        <Actions onEdit={onEdit} onDelete={() => remove('magics', m.id)} />
      </div>
      <p className="text-xs text-purple-300">{m.type} • {m.element}</p>
      <p className="mt-2 text-sm text-zinc-300 whitespace-pre-line">{m.description}</p>
      <div className="mt-2 space-y-1 text-xs text-zinc-400">
        {details.map(([k, v]) => v && <p key={k} className="whitespace-pre-line"><b className="text-zinc-300">{k}:</b> {v}</p>)}
      </div>
    </Card>
  )
}
