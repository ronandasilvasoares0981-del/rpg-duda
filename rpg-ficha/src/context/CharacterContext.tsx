import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Character } from '../types/character'
import { DEFAULT_ELEMENTS, ElementDef } from '../types/elements'
import { Magic } from '../types/magic'
import { Passive } from '../types/passive'
import { Accessory } from '../types/accessory'

export interface AppState {
  dark: boolean; character: Character; magics: Magic[]; passives: Passive[]; accessories: Accessory[]
  elementDefs: ElementDef[] // paleta de elementos (nome, ícone, cor) — editável pelo usuário
}
export type ListKey = 'magics' | 'passives' | 'accessories'
type Item = Magic | Passive | Accessory

// Ficha inicial (usada no "Resetar dados")
export const INITIAL: AppState = {
  dark: true,
  character: {
    name: 'Elisa', player: 'Ronan', race: 'Nokturno', klass: 'Ilusionista Materializadora / Bardo',
    level: 12, age: 1309, height: '1.70', weight: '66',
    elements: ['Fogo', 'Luz', 'Escuridão', 'Sangue', 'Selo'],
    hp: 403, hpMax: 403, san: 100, sanMax: 100, image: '',
    stats: { Força: 339, Velocidade: 363, Defesa: 402, Inteligência: 202, Sabedoria: 156, Carisma: 104 },
    resources: { 'Pontos de Ação': 0, Mana: 0, Energia: 0 },
  },
  magics: [], passives: [], accessories: [], elementDefs: DEFAULT_ELEMENTS,
}

// Remove colunas do banco que o app não usa e troca null por ''
const clean = (r: any) => {
  const { character_id, created_at, ...rest } = r
  return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? '']))
}

// ---------- LER do Supabase ----------
async function fetchAll(): Promise<{ cid: string; state: AppState }> {
  const first = () => supabase.from('characters').select('*').order('created_at').limit(1).maybeSingle()
  let { data: row } = await first()
  if (!row) { await supabase.rpc('seed_elisa'); row = (await first()).data } // primeiro acesso: cria a Elisa
  if (!row) throw new Error('Não foi possível carregar a ficha. O supabase.sql já foi executado?')

  const q = (t: string, order: string) => supabase.from(t).select('*').eq('character_id', row.id).order(order)
  const [st, mg, ps, ac] = await Promise.all([q('stats', 'sort'), q('magics', 'created_at'), q('passives', 'created_at'), q('accessories', 'created_at')])
  const rec = (kind: string) => Object.fromEntries((st.data ?? []).filter((r: any) => r.kind === kind).map((r: any) => [r.name, r.value]))
  const txt = (v: unknown) => (v == null ? '' : String(v))

  return {
    cid: row.id,
    state: {
      dark: localStorage.getItem('dark') !== '0', // tema é preferência do aparelho
      character: {
        name: row.name, player: txt(row.player), race: txt(row.race), klass: txt(row.klass),
        level: row.level, age: row.age ?? 0, height: txt(row.height), weight: txt(row.weight),
        elements: row.elements, hp: row.hp, hpMax: row.hp_max, san: row.san, sanMax: row.san_max,
        image: txt(row.image_url), stats: rec('atributo'), resources: rec('recurso'),
      },
      magics: (mg.data ?? []).map(clean) as unknown as Magic[],
      passives: (ps.data ?? []).map(clean) as unknown as Passive[],
      accessories: (ac.data ?? []).map((r: any) => ({ ...clean(r), image: txt(r.image_url) })) as unknown as Accessory[],
      elementDefs: Array.isArray(row.elements_meta) && row.elements_meta.length ? row.elements_meta : DEFAULT_ELEMENTS,
    },
  }
}

// ---------- GRAVAR no Supabase ----------
async function push(cid: string, s: AppState) {
  const c = s.character
  const chk = (label: string, r: { error: { message: string } | null }) => { if (r.error) console.error(label, r.error.message) }

  chk('ficha', await supabase.from('characters').update({
    name: c.name, player: c.player, race: c.race, klass: c.klass, level: c.level, age: c.age,
    height: Number(c.height) || null, weight: Number(c.weight) || null, elements: c.elements,
    hp: c.hp, hp_max: c.hpMax, san: c.san, san_max: c.sanMax, image_url: c.image || null,
    elements_meta: s.elementDefs,
  }).eq('id', cid))

  // Status: apaga e regrava (a coluna "sort" guarda a ordem)
  await supabase.from('stats').delete().eq('character_id', cid)
  chk('status', await supabase.from('stats').insert([
    ...Object.entries(c.stats).map(([name, value]) => ({ character_id: cid, kind: 'atributo', name, value })),
    ...Object.entries(c.resources).map(([name, value]) => ({ character_id: cid, kind: 'recurso', name, value })),
  ]))

  // Listas: grava/atualiza os itens e apaga os que foram removidos no app
  for (const key of ['magics', 'passives', 'accessories'] as ListKey[]) {
    const items = s[key] as Item[]
    const rows = items.map(i => {
      if (key !== 'accessories') return { ...i, character_id: cid }
      const { image, ...rest } = i as Accessory
      return { ...rest, image_url: image || null, character_id: cid }
    })
    if (rows.length) chk(key, await supabase.from(key).upsert(rows))
    let del = supabase.from(key).delete().eq('character_id', cid)
    if (items.length) del = del.not('id', 'in', `(${items.map(i => i.id).join(',')})`)
    chk(key, await del)
  }
}

interface Ctx {
  state: AppState
  setCharacter: (p: Partial<Character>) => void
  setStat: (name: string, v: number) => void
  setResource: (name: string, v: number) => void
  save: (key: ListKey, item: Item) => void
  remove: (key: ListKey, id: string) => void
  addElementDef: (def: ElementDef) => void      // cria um elemento novo na paleta
  removeElementDef: (name: string) => void      // remove da paleta e desmarca do personagem
  setDark: (d: boolean) => void
  replaceAll: (s: AppState) => void
  reset: () => void
}
const Context = createContext<Ctx>(null!)
export const useCharacter = () => useContext(Context)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)
  const [err, setErr] = useState('')
  const cid = useRef('')                                   // id da ficha no banco
  const dirty = useRef(false)                              // true = há mudança do usuário para enviar
  const queue = useRef<Promise<void>>(Promise.resolve())   // envia uma gravação por vez

  // Ao abrir: carrega do Supabase
  useEffect(() => {
    fetchAll().then(r => { cid.current = r.cid; setState(r.state) }).catch(e => setErr(e.message))
  }, [])

  // Depois de cada mudança do usuário, grava no banco (com espera de 0,8 s para agrupar digitação)
  useEffect(() => {
    if (!state || !dirty.current) return
    const t = setTimeout(() => { queue.current = queue.current.then(() => push(cid.current, state)) }, 800)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => { document.documentElement.classList.toggle('light', state ? !state.dark : false) }, [state?.dark])

  if (err) return <p className="p-8 text-red-400">{err}</p>
  if (!state) return <p className="p-8 text-zinc-400">Carregando ficha…</p>

  // set: toda alteração do usuário passa por aqui (marca "dirty" para disparar a gravação)
  const set = (fn: (s: AppState) => AppState) => { dirty.current = true; setState(s => (s ? fn(s) : s)) }
  const char = (fn: (c: Character) => Character) => set(s => ({ ...s, character: fn(s.character) }))

  const value: Ctx = {
    state,
    setCharacter: p => char(c => ({ ...c, ...p })),
    setStat: (k, v) => char(c => ({ ...c, stats: { ...c.stats, [k]: v } })),
    setResource: (k, v) => char(c => ({ ...c, resources: { ...c.resources, [k]: v } })),
    save: (key, item) => set(s => {
      const list = s[key] as Item[]
      const next = list.some(i => i.id === item.id) ? list.map(i => (i.id === item.id ? item : i)) : [...list, item]
      return { ...s, [key]: next } as AppState
    }),
    remove: (key, id) => set(s => ({ ...s, [key]: (s[key] as Item[]).filter(i => i.id !== id) }) as AppState),
    addElementDef: def => set(s => s.elementDefs.some(d => d.name === def.name) ? s : { ...s, elementDefs: [...s.elementDefs, def] }),
    removeElementDef: name => set(s => ({
      ...s,
      elementDefs: s.elementDefs.filter(d => d.name !== name),
      character: { ...s.character, elements: s.character.elements.filter(e => e !== name) }, // desmarca do personagem
    })),
    setDark: dark => { localStorage.setItem('dark', dark ? '1' : '0'); setState(s => (s ? { ...s, dark } : s)) },
    replaceAll: s => set(() => ({ ...INITIAL, ...s })),
    reset: () => set(() => INITIAL),
  }
  return <Context.Provider value={value}>{children}</Context.Provider>
}
