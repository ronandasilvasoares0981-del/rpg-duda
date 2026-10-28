import { ReactNode, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Bar, inputCls } from './ui'

// Calculadora de dano/cura de um recurso com barra (Vida ou Sanidade).
// Digite um valor e clique em "Dano" (subtrai) ou "Cura" (soma).
// O resultado nunca passa de 0 nem do máximo.
export default function ResourceCalculator({
  label, icon, value, max, barColor, btnColor, onChange,
}: {
  label: string; icon?: ReactNode; value: number; max: number
  barColor: string; btnColor: string; onChange: (n: number) => void
}) {
  const [amount, setAmount] = useState(0) // quanto será somado/subtraído
  const clamp = (n: number) => Math.max(0, Math.min(max, n))
  const dano = () => onChange(clamp(value - amount))
  const cura = () => onChange(clamp(value + amount))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-zinc-300">{icon}{label}</span>
        <span className="text-zinc-400">{value} / {max}</span>
      </div>
      <Bar value={value} max={max} color={barColor} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number" min={0} className={`${inputCls} w-24`} value={amount}
          onChange={e => setAmount(Math.max(0, Number(e.target.value) || 0))}
        />
        <button className="inline-flex items-center gap-1 rounded-lg bg-red-800 px-3 py-2 text-sm text-white transition hover:bg-red-700" onClick={dano}>
          <Minus size={14} /> Dano
        </button>
        <button className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white transition ${btnColor}`} onClick={cura}>
          <Plus size={14} /> Cura
        </button>
      </div>
    </div>
  )
}
