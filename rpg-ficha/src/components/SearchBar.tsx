// Barra de pesquisa: procura em toda a ficha (nome, atributos, elementos, equipamentos, magias, passivas, aliados e lore)
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useSheet } from '../store'
import { Sheet } from '../types'

export interface Hit { key: string; tab: string; tabLabel: string; title: string; snippet: string; target?: string }

// Tira acentos e maiúsculas: "Ária" casa com "aria"
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Recorta um trecho do texto em volta do termo encontrado
function snippet(text: string, q: string) {
  const t = text.replace(/\s+/g, ' ').trim()
  const i = norm(t).indexOf(q)
  if (i < 0) return t.slice(0, 80)
  const start = Math.max(0, i - 25)
  return (start ? '…' : '') + t.slice(start, i + q.length + 55) + (t.length > i + q.length + 55 ? '…' : '')
}

// Monta a lista de resultados. Para criar uma nova busca (ex.: nova lista), acrescente um bloco aqui.
export function search(s: Sheet, raw: string): Hit[] {
  const q = norm(raw.trim())
  if (!q) return []
  const hits: Hit[] = []
  const add = (tab: string, tabLabel: string, key: string, title: string, fields: string[], target?: string) => {
    const f = fields.find(x => norm(x).includes(q))
    if (f !== undefined || norm(title).includes(q)) hits.push({ key, tab, tabLabel, title: title || '(sem nome)', snippet: f !== undefined && norm(title).includes(q) === false ? snippet(f, q) : '', target })
  }
  add('ficha', 'Ficha', 'info', s.name || 'Informações', [s.name, s.race, s.klass, s.level ? `Nível ${s.level}` : ''])
  s.elements.forEach(e => add('ficha', 'Elementos', e.id, e.name, [], `item-${e.id}`))
  s.customAttrs.forEach(a => add('ficha', 'Atributo', a.id, a.label, [], `item-${a.id}`))
  const lists: [keyof Pick<Sheet, 'equipment' | 'spells' | 'passives'>, string, string][] =
    [['equipment', 'equip', 'Equipamento'], ['spells', 'magias', 'Magia'], ['passives', 'passivas', 'Passiva']]
  lists.forEach(([f, tab, label]) => s[f].forEach(e => add(tab, label, e.id, e.name, [e.tag, e.description], `item-${e.id}`)))
  s.allies.forEach(a => add('aliados', 'Aliado', a.id, a.name, [a.relation, a.notes], `item-${a.id}`))
  add('lore', 'Lore', 'lore', 'História', [s.lore])
  s.chapters.forEach(c => add('lore', 'Registro', c.id, c.title, [c.text], `item-${c.id}`))
  return hits
}

export default function SearchBar({ onGo }: { onGo: (h: Hit) => void }) {
  const { sheet } = useSheet()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const hits = useMemo(() => search(sheet, q), [sheet, q])

  // Fecha a lista ao clicar fora
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (h: Hit) => { onGo(h); setOpen(false); setQ('') }

  return (
    <div ref={box} className="w-full min-w-0 max-w-md sm:relative" role="search">
      <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input type="search" aria-label="Pesquisar na ficha" placeholder="Pesquisar na ficha…"
        className="w-full rounded-full border border-purple-500/30 bg-zinc-900 py-2 pl-9 pr-9 text-base text-zinc-100 outline-none transition focus:border-amber-400 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
        value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && hits[0]) go(hits[0]) }} />
      {q && <button aria-label="Limpar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-amber-400" onClick={() => setQ('')}><X size={16} /></button>}
      </div>
      {open && q.trim() && (
        <ul className="absolute left-2 right-2 top-full z-30 mt-1 max-h-[60vh] sm:left-0 sm:right-0 sm:mt-2 sm:max-h-80 overflow-y-auto rounded-xl border border-purple-500/40 bg-zinc-950 p-1 shadow-xl">
          {hits.length === 0 && <li className="px-3 py-2 text-sm text-zinc-400">Nada encontrado para “{q.trim()}”.</li>}
          {hits.map(h => (
            <li key={h.key}>
              <button className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-zinc-900" onClick={() => go(h)}>
                <span className="flex items-center gap-2">
                  <span className="truncate font-bold text-amber-300">{h.title}</span>
                  <span className="shrink-0 rounded bg-purple-700/40 px-1.5 text-xs text-purple-200">{h.tabLabel}</span>
                </span>
                {h.snippet && <span className="block truncate text-xs text-zinc-400">{h.snippet}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
