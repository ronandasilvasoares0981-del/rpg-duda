// Página genérica de lista: serve para Equipamentos, Magias e Passivas (com pesquisa e filtros)
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useSheet } from '../store'
import { Entry, NO_TAG, SearchField, Sheet, SortMode, filterEntries, newId } from '../types'
import { Card, DeleteBtn, Field, Txt, btnCls, inputCls } from '../components/ui'

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

  // Pesquisa e filtros (valem só enquanto a aba está aberta)
  const [q, setQ] = useState('')
  const [where, setWhere] = useState<SearchField>('all')
  const [tagPick, setTagPick] = useState('')
  const [sort, setSort] = useState<SortMode>('orig')

  // Opções do filtro: as tags que existem na lista agora (se uma sumir, o filtro volta para "Todos")
  const tags = useMemo(() => [...new Set(items.map(i => i.tag.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [items])
  const hasUntagged = items.some(i => !i.tag.trim())
  const tag = tagPick === NO_TAG ? (hasUntagged ? NO_TAG : '') : tags.includes(tagPick) ? tagPick : ''

  const shown = useMemo(() => filterEntries(items, { q, field: where, tag, sort }), [items, q, where, tag, sort])
  const filtering = q.trim() !== '' || tag !== ''
  const clear = () => { setQ(''); setWhere('all'); setTagPick('') }

  // Ao criar um item, limpa os filtros para o novo card aparecer (no topo)
  const add = () => { clear(); setSort('orig'); setItems(l => [{ id: newId(), name: '', tag: '', description: '' }, ...l]) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-amber-400">{icon} {title}</h1>
        <button className={btnCls} onClick={add}>+ {newLabel}</button>
      </div>

      {items.length === 0 && <Card><p className="text-zinc-400">{empty} Use o botão acima para registrar o primeiro.</p></Card>}

      {items.length > 0 && (
        <Card className="space-y-3">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" autoComplete="off" aria-label={`Pesquisar em ${title}`} placeholder={`Pesquisar em ${title.toLowerCase()}…`}
              className={`${inputCls} pl-10 pr-10`} value={q} onChange={e => setQ(e.target.value)} />
            {q && (
              <button aria-label="Limpar pesquisa" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 transition hover:text-amber-400"
                onClick={() => setQ('')}><X size={16} /></button>
            )}
          </div>
          <div className={`grid gap-3 ${tags.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            <Field label="Pesquisar em">
              <select className={inputCls} value={where} onChange={e => setWhere(e.target.value as SearchField)}>
                <option value="all">Tudo</option>
                <option value="name">Nome</option>
                <option value="tag">{tagLabel}</option>
                <option value="description">Descrição e efeitos</option>
              </select>
            </Field>
            {tags.length > 0 && (
              <Field label={`Filtrar por ${tagLabel.toLowerCase()}`}>
                <select className={inputCls} value={tag} onChange={e => setTagPick(e.target.value)}>
                  <option value="">Todos</option>
                  {tags.map(t => <option key={t} value={t}>{t}</option>)}
                  {hasUntagged && <option value={NO_TAG}>Sem {tagLabel.toLowerCase()}</option>}
                </select>
              </Field>
            )}
            <Field label="Ordenar">
              <select className={inputCls} value={sort} onChange={e => setSort(e.target.value as SortMode)}>
                <option value="orig">Ordem da lista</option>
                <option value="az">Nome (A → Z)</option>
                <option value="za">Nome (Z → A)</option>
              </select>
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-zinc-400">
            <span role="status">{filtering ? `${shown.length} de ${items.length}` : `${items.length}`} {items.length === 1 ? 'item' : 'itens'}</span>
            {filtering && <button className="hover:text-amber-400" onClick={clear}>Limpar filtros</button>}
          </div>
        </Card>
      )}

      {items.length > 0 && shown.length === 0 && (
        <Card><p className="text-zinc-400">Nenhum item combina com a pesquisa. <button className="text-amber-400 hover:underline" onClick={clear}>Limpar filtros</button></p></Card>
      )}

      {shown.map(it => (
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
