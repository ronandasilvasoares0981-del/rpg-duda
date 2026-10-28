// Página genérica de lista: serve para Equipamentos, Magias e Passivas
import { useSheet } from '../store'
import { Entry, Sheet, newId } from '../types'
import { Card, DeleteBtn, Txt, btnCls, inputCls } from '../components/ui'

interface Props {
  field: 'equipment' | 'spells' | 'passives'
  title: string; icon: string
  tagLabel: string; tagHint: string
  newLabel: string; empty: string
}

export default function EntryPage({ field, title, icon, tagLabel, tagHint, newLabel, empty }: Props) {
  const { sheet, update } = useSheet()
  const items = sheet[field]
  const setItems = (fn: (l: Entry[]) => Entry[]) => update(p => ({ ...p, [field]: fn(p[field]) }) as Sheet)
  const edit = (id: string, patch: Partial<Entry>) => setItems(l => l.map(x => (x.id === id ? { ...x, ...patch } : x)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-amber-400">{icon} {title}</h1>
        <button className={btnCls} onClick={() => setItems(l => [{ id: newId(), name: '', tag: '', description: '' }, ...l])}>+ {newLabel}</button>
      </div>
      {items.length === 0 && <Card><p className="text-zinc-400">{empty} Use o botão acima para registrar o primeiro.</p></Card>}
      {items.map(it => (
        <Card key={it.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <input aria-label="Nome" className={`${inputCls} text-lg font-bold text-amber-300`} placeholder={newLabel}
              value={it.name} onChange={e => edit(it.id, { name: e.target.value })} />
            <DeleteBtn what={`"${it.name || 'este item'}"`} onDelete={() => setItems(l => l.filter(x => x.id !== it.id))} />
          </div>
          <Txt label={tagLabel} placeholder={tagHint} value={it.tag} onChange={v => edit(it.id, { tag: v })} />
          <Txt label="Descrição e efeitos" area rows={4} value={it.description} onChange={v => edit(it.id, { description: v })} />
        </Card>
      ))}
    </div>
  )
}
