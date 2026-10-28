import { useSheet } from '../store'
import { Chapter, newId } from '../types'
import { Card, DeleteBtn, Txt, btnCls, inputCls } from '../components/ui'

// Lore: um texto principal com a história do personagem e registros (capítulos) separados
export default function Lore() {
  const { sheet, update } = useSheet()
  const chapters = sheet.chapters
  const setChapters = (fn: (l: Chapter[]) => Chapter[]) => update(p => ({ ...p, chapters: fn(p.chapters) }))
  const edit = (id: string, patch: Partial<Chapter>) => setChapters(l => l.map(x => (x.id === id ? { ...x, ...patch } : x)))

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">📜 Lore</h1>
        <Txt label={`História de ${sheet.name || 'seu personagem'}`} area rows={14}
          placeholder="Origem, infância, o que mudou o rumo da história, segredos, objetivos…"
          value={sheet.lore} onChange={v => update(p => ({ ...p, lore: v }))} />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-amber-400">📖 Registros</h2>
        <button className={btnCls} onClick={() => setChapters(l => [{ id: newId(), title: '', text: '' }, ...l])}>+ Novo registro</button>
      </div>
      {chapters.length === 0 && (
        <Card><p className="text-zinc-400">Nenhum registro ainda. Use para capítulos, eventos marcantes, lembranças e segredos do personagem.</p></Card>
      )}
      {chapters.map(c => (
        <Card key={c.id} id={`item-${c.id}`} className="space-y-3">
          <div className="flex items-center gap-3">
            <input aria-label="Título do registro" className={`${inputCls} text-lg font-bold text-amber-300`} placeholder="Título do registro"
              value={c.title} onChange={e => edit(c.id, { title: e.target.value })} />
            <DeleteBtn what={`"${c.title || 'este registro'}"`} onDelete={() => setChapters(l => l.filter(x => x.id !== c.id))} />
          </div>
          <Txt label="Texto" area rows={8} value={c.text} onChange={v => edit(c.id, { text: v })} />
        </Card>
      ))}
    </div>
  )
}
