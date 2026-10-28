import { Minus, Plus } from 'lucide-react'
import { Card, Num } from './ui'

// Card de métrica. Sem onChange = só leitura (aba Ficha); com onChange = botões − / + e campo (aba Status)
export default function StatusCard({ name, value, onChange }: { name: string; value: number; onChange?: (n: number) => void }) {
  return (
    <Card className="text-center">
      <p className="text-sm text-zinc-400">{name}</p>
      {onChange ? (
        <div className="mt-2 flex items-center gap-2">
          <button aria-label="Diminuir" className="rounded-lg bg-zinc-800 p-2 hover:bg-purple-700" onClick={() => onChange(value - 1)}><Minus size={16} /></button>
          <Num value={value} onChange={onChange} />
          <button aria-label="Aumentar" className="rounded-lg bg-zinc-800 p-2 hover:bg-purple-700" onClick={() => onChange(value + 1)}><Plus size={16} /></button>
        </div>
      ) : <p className="text-3xl font-bold text-amber-400">{value}</p>}
    </Card>
  )
}
