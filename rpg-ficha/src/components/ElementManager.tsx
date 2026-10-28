import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { COLOR_PRESETS } from '../types/elements'

// Campo compacto (igual ao inputCls, mas sem w-full — aqui os campos ficam lado a lado)
const fieldCls = 'rounded-lg border border-purple-500/30 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none transition focus:border-amber-400'

// Gerencia os elementos: clicar num chip marca/desmarca no personagem;
// o "x" remove o elemento de vez da lista; o formulário cria um novo.
export default function ElementManager() {
  const { state, setCharacter, addElementDef, removeElementDef } = useCharacter()
  const c = state.character
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🌟')
  const [color, setColor] = useState(COLOR_PRESETS[0].cls)

  const toggle = (n: string) => setCharacter({ elements: c.elements.includes(n) ? c.elements.filter(x => x !== n) : [...c.elements, n] })
  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addElementDef({ name: trimmed, icon: icon.trim() || '✦', cls: color })
    setName('')
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">Elementos</p>
      <div className="flex flex-wrap gap-2">
        {state.elementDefs.map(d => {
          const on = c.elements.includes(d.name)
          return (
            <span key={d.name} className={`flex items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-sm transition ${on ? d.cls : 'border-zinc-700 text-zinc-500'}`}>
              <button onClick={() => toggle(d.name)}>{d.icon} {d.name}</button>
              <button aria-label={`Remover elemento ${d.name}`} className="rounded-full p-1 text-zinc-500 hover:text-red-400"
                onClick={() => confirm(`Remover o elemento "${d.name}" da lista? Ele será desmarcado do personagem.`) && removeElementDef(d.name)}>
                <X size={12} />
              </button>
            </span>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input className={`${fieldCls} w-20`} placeholder="Ícone" value={icon} onChange={e => setIcon(e.target.value)} />
        <input className={`${fieldCls} min-w-[10rem] flex-1`} placeholder="Nome do novo elemento" value={name} onChange={e => setName(e.target.value)} />
        <select className={`${fieldCls} w-32`} value={color} onChange={e => setColor(e.target.value)}>
          {COLOR_PRESETS.map(p => <option key={p.cls} value={p.cls}>{p.label}</option>)}
        </select>
        <button className="inline-flex items-center gap-1 rounded-lg bg-purple-700 px-3 py-2 text-sm text-white transition hover:bg-purple-600" onClick={add}>
          <Plus size={14} /> Adicionar
        </button>
      </div>
    </div>
  )
}
