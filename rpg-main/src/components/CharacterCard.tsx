import { User } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { Bar, Card } from './ui'

// Cabeçalho da ficha: imagem, nome, nível/raça/classe, elementos e barras de HP e Sanidade
export default function CharacterCard() {
  const { state } = useCharacter()
  const c = state.character
  const meta = (name: string) => state.elementDefs.find(d => d.name === name)
  return (
    <Card className="flex flex-col items-center gap-4 sm:flex-row">
      {c.image
        ? <img src={c.image} alt={c.name} className="h-36 w-36 rounded-2xl border border-amber-400/50 object-cover" />
        : <div className="grid h-36 w-36 place-items-center rounded-2xl bg-zinc-800 text-zinc-500"><User size={48} /></div>}
      <div className="w-full flex-1 space-y-2">
        <p className="text-sm text-zinc-400">📖 Ficha de Personagem</p>
        <h1 className="text-4xl font-bold text-amber-400">{c.name}</h1>
        <p>Nível {c.level} • {c.race} • {c.klass}</p>
        <div className="flex flex-wrap gap-2">
          {c.elements.map(e => <span key={e} className={`rounded-full border px-3 py-0.5 text-xs ${meta(e)?.cls ?? ''}`}>{meta(e)?.icon} {e}</span>)}
        </div>
        <p className="text-sm">❤️ HP {c.hp} / {c.hpMax}</p>
        <Bar value={c.hp} max={c.hpMax} color="bg-red-600" />
        <p className="text-sm">🧠 Sanidade {c.san} / {c.sanMax}</p>
        <Bar value={c.san} max={c.sanMax} color="bg-blue-500" />
      </div>
    </Card>
  )
}
