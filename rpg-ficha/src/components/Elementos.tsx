// Elementos do personagem: botões prontos (Fogo, Água...) e opção de criar um personalizado
import { useSheet } from '../store'
import { ELEMENT_PRESETS, Elemento, newId } from '../types'
import { Card, DeleteBtn, Num, btnCls, inputBase, inputCls } from './ui'

export default function Elementos() {
  const { sheet, update } = useSheet()
  const list = sheet.elements
  const setList = (fn: (l: Elemento[]) => Elemento[]) => update(p => ({ ...p, elements: fn(p.elements) }))
  const edit = (id: string, patch: Partial<Elemento>) => setList(l => l.map(x => (x.id === id ? { ...x, ...patch } : x)))
  const add = (name = '', icon = '🔮') => setList(l => [...l, { id: newId(), name, icon, level: 0, notes: '' }])
  // Só oferece os prontos que ainda não foram adicionados
  const livres = ELEMENT_PRESETS.filter(p => !list.some(e => e.name.trim().toLowerCase() === p.name.toLowerCase()))

  return (
    <Card className="space-y-3">
      <h2 className="text-2xl font-bold text-amber-400">🔥 Elementos</h2>
      {list.length === 0 && <p className="text-zinc-400">Nenhum elemento ainda. Escolha um abaixo ou crie o seu.</p>}
      {list.map(e => (
        <div key={e.id} className="space-y-2 rounded-xl border border-purple-500/30 bg-zinc-950 p-3">
          <div className="flex items-center gap-2">
            <input aria-label="Ícone do elemento" maxLength={8} className={`${inputBase} w-14 shrink-0 text-center`}
              value={e.icon} onChange={ev => edit(e.id, { icon: ev.target.value })} />
            <input aria-label="Nome do elemento" placeholder="Nome (ex.: Fogo)" className={`${inputCls} min-w-0 font-bold text-amber-300`}
              value={e.name} onChange={ev => edit(e.id, { name: ev.target.value })} />
            <Num label="Nível do elemento" value={e.level} onChange={n => edit(e.id, { level: n })} className={`${inputBase} w-20 shrink-0 text-center`} />
            <DeleteBtn what={`"${e.name || 'este elemento'}"`} onDelete={() => setList(l => l.filter(x => x.id !== e.id))} />
          </div>
          <input aria-label="Anotações do elemento" placeholder="Anotações (opcional)" className={inputCls}
            value={e.notes} onChange={ev => edit(e.id, { notes: ev.target.value })} />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {livres.map(p => (
          <button key={p.name} className="rounded-full border border-purple-500/40 px-3 py-1 text-sm text-zinc-300 transition hover:border-amber-400 hover:text-amber-300"
            onClick={() => add(p.name, p.icon)}>{p.icon} {p.name}</button>
        ))}
        <button className={btnCls} onClick={() => add()}>+ Elemento personalizado</button>
      </div>
    </Card>
  )
}
