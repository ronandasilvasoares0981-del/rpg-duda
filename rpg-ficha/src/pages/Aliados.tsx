import { useSheet } from '../store'
import { Ally, newId } from '../types'
import { Card, DeleteBtn, PhotoBox, Txt, btnCls, inputCls } from '../components/ui'

// Aliados: foto, nome, relação com o personagem e anotações
export default function Aliados() {
  const { sheet, update } = useSheet()
  const allies = sheet.allies
  const setAllies = (fn: (l: Ally[]) => Ally[]) => update(p => ({ ...p, allies: fn(p.allies) }))
  const edit = (id: string, patch: Partial<Ally>) => setAllies(l => l.map(x => (x.id === id ? { ...x, ...patch } : x)))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">🤝 Aliados</h1>
        <button className={btnCls} onClick={() => setAllies(l => [{ id: newId(), name: '', relation: '', notes: '', image: '' }, ...l])}>+ Novo aliado</button>
      </div>
      {allies.length === 0 && (
        <Card><p className="text-zinc-400">Nenhum aliado ainda. Adicione foto, nome, relação e anotações de cada companheiro de jornada.</p></Card>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allies.map(a => (
          <Card key={a.id} id={`item-${a.id}`} className="space-y-3">
            <PhotoBox src={a.image} onChange={u => edit(a.id, { image: u })} className="aspect-[4/5] w-full" label="Foto do aliado" />
            <div className="flex items-center gap-2">
              <input aria-label="Nome do aliado" className={`${inputCls} text-lg font-bold text-amber-300`} placeholder="Nome"
                value={a.name} onChange={e => edit(a.id, { name: e.target.value })} />
              <DeleteBtn what={`"${a.name || 'este aliado'}"`} onDelete={() => setAllies(l => l.filter(x => x.id !== a.id))} />
            </div>
            <Txt label="Relação" placeholder="Ex.: mentor, rival, irmã" value={a.relation} onChange={v => edit(a.id, { relation: v })} />
            <Txt label="Anotações" area rows={4} placeholder="Habilidades, história, onde encontrar" value={a.notes} onChange={v => edit(a.id, { notes: v })} />
          </Card>
        ))}
      </div>
    </div>
  )
}
