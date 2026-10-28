import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Character } from '../types/character'
import { DEFAULT_ELEMENTS, ElementDef } from '../types/elements'
import { Magic, newMagic } from '../types/magic'
import { Passive, newPassive } from '../types/passive'
import { Accessory, newAccessory } from '../types/accessory'

export interface AppState {
  dark: boolean; character: Character; magics: Magic[]; passives: Passive[]; accessories: Accessory[]
  elementDefs: ElementDef[] // paleta de elementos (nome, ícone, cor) — editável pelo usuário
}
export type ListKey = 'magics' | 'passives' | 'accessories'
type Item = Magic | Passive | Accessory

// Ficha em branco (usada no "Resetar dados")
export const INITIAL: AppState = {
  dark: true,
  character: {
    name: 'Novo Personagem', player: '', race: '', klass: '',
    level: 1, age: 0, height: '', weight: '',
    elements: [],
    hp: 0, hpMax: 0, san: 0, sanMax: 0, image: '',
    stats: { Força: 0, Velocidade: 0, Defesa: 0, Inteligência: 0, Sabedoria: 0, Carisma: 0 },
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
  const r1 = await first()
  if (r1.error) throw new Error(`Erro ao carregar a ficha: ${r1.error.message}. O supabase.sql já foi executado?`)
  let row = r1.data
  if (!row) { // primeiro acesso: cria uma ficha em branco
    const seed = await supabase.rpc('seed_character')
    if (seed.error) throw new Error(`Erro ao criar a ficha: ${seed.error.message}. Rode o supabase.sql de novo no Supabase.`)
    row = (await first()).data
  }
  if (!row) throw new Error('Não foi possível carregar a ficha. O supabase.sql já foi executado?')

  const q = (t: string, order: string) => supabase.from(t).select('*').eq('character_id', row.id).order(order)
  const [st, mg, ps, ac] = await Promise.all([q('stats', 'sort'), q('magics', 'created_at'), q('passives', 'created_at'), q('accessories', 'created_at')])
  const bad = [st, mg, ps, ac].find(r => r.error)
  if (bad?.error) throw new Error(`Erro ao carregar os dados: ${bad.error.message}`)
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
// Texto entre aspas para usar dentro de um filtro "in (...)" do Supabase
const quote = (v: string) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
const int = (n: number) => Math.round(Number(n) || 0)                          // colunas int não aceitam decimais
const dec = (v: string) => Number(String(v).replace(',', '.')) || null          // aceita "1,70" e "1.70"

// Devolve '' se tudo foi salvo, ou a mensagem de erro
async function push(cid: string, s: AppState): Promise<string> {
  const c = s.character
  const errs: string[] = []
  const chk = (label: string, r: { error: { message: string } | null }) => {
    if (r.error) { console.error(label, r.error.message); errs.push(`${label}: ${r.error.message}`) }
  }

  chk('ficha', await supabase.from('characters').update({
    name: c.name, player: c.player, race: c.race, klass: c.klass, level: int(c.level), age: int(c.age),
    height: dec(c.height), weight: dec(c.weight), elements: c.elements,
    hp: int(c.hp), hp_max: int(c.hpMax), san: int(c.san), san_max: int(c.sanMax), image_url: c.image || null,
    elements_meta: s.elementDefs,
  }).eq('id', cid))

  // Status: grava/atualiza cada item e só apaga o que foi removido
  // (antes apagava tudo e regravava — se a gravação falhasse no meio, os status se perdiam)
  const rows = [
    ...Object.entries(c.stats).map(([name, value]) => ({ character_id: cid, kind: 'atributo', name, value: int(value) })),
    ...Object.entries(c.resources).map(([name, value]) => ({ character_id: cid, kind: 'recurso', name, value: int(value) })),
  ]
  const up = await supabase.from('stats').upsert(rows, { onConflict: 'character_id,kind,name' })
  chk('status', up)
  if (!up.error) {
    for (const [kind, rec] of [['atributo', c.stats], ['recurso', c.resources]] as const) {
      const names = Object.keys(rec)
      let del = supabase.from('stats').delete().eq('character_id', cid).eq('kind', kind)
      if (names.length) del = del.not('name', 'in', `(${names.map(quote).join(',')})`)
      chk('status', await del)
    }
  }

  // Listas: grava/atualiza os itens e apaga os que foram removidos no app
  for (const key of ['magics', 'passives', 'accessories'] as ListKey[]) {
    const items = s[key] as Item[]
    const rows = items.map(i => {
      if (key !== 'accessories') return { ...i, character_id: cid }
      const { image, ...rest } = i as Accessory
      return { ...rest, image_url: image || null, character_id: cid }
    })
    if (rows.length) {
      const r = await supabase.from(key).upsert(rows)
      chk(key, r)
      if (r.error) continue // não apaga nada se a gravação falhou
    }
    let del = supabase.from(key).delete().eq('character_id', cid)
    if (items.length) del = del.not('id', 'in', `(${items.map(i => i.id).join(',')})`)
    chk(key, await del)
  }
  return errs.join(' | ')
}

// ---------- IMPORTAR (valida um JSON vindo de fora) ----------
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v)

// Mantém só os campos esperados, com o tipo certo; o que faltar ou vier errado usa o valor padrão
const coerce = <T extends object>(blank: T, raw: unknown): T => {
  const src: Record<string, any> = isObj(raw) ? raw : {}
  return Object.fromEntries(Object.entries(blank).map(([k, d]) => {
    const v = src[k]
    if (Array.isArray(d)) return [k, Array.isArray(v) ? v.filter(x => typeof x === 'string') : d]
    return [k, typeof v === typeof d && v !== null ? v : d]
  })) as T
}
const numRec = (v: unknown, d: Record<string, number>) =>
  isObj(v) ? (Object.fromEntries(Object.entries(v).filter(([, n]) => typeof n === 'number' && Number.isFinite(n))) as Record<string, number>) : d
// Ids precisam ser UUID (o banco recusa outros formatos): gera um novo se vier inválido
const list = <T extends { id: string }>(blank: () => T, raw: unknown): T[] =>
  Array.isArray(raw) ? raw.map(x => { const o = coerce(blank(), x); return { ...o, id: UUID.test(o.id) ? o.id : crypto.randomUUID() } }) : []

// Transforma um JSON qualquer em um AppState seguro (lança erro em português se não for uma ficha)
export function normalizeState(raw: unknown): AppState {
  if (!isObj(raw) || !isObj(raw.character)) throw new Error('Arquivo inválido: use um JSON exportado por este app.')
  const character = coerce(INITIAL.character, raw.character)
  character.stats = numRec(raw.character.stats, INITIAL.character.stats)
  character.resources = numRec(raw.character.resources, INITIAL.character.resources)
  const defs: ElementDef[] = Array.isArray(raw.elementDefs)
    ? raw.elementDefs.filter(d => isObj(d) && typeof d.name === 'string' && d.name && typeof d.icon === 'string' && typeof d.cls === 'string')
        .map(d => ({ name: d.name, icon: d.icon, cls: d.cls }))
    : []
  return {
    dark: INITIAL.dark, character,
    magics: list(newMagic, raw.magics), passives: list(newPassive, raw.passives), accessories: list(newAccessory, raw.accessories),
    elementDefs: defs.length ? defs : DEFAULT_ELEMENTS,
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
  const version = useRef(0)                                 // conta as alterações do usuário
  const pending = useRef(false)                             // true = há alteração ainda não gravada
  const [saveErr, setSaveErr] = useState('')                // erro da última gravação (aparece na tela)

  // Avisa antes de fechar a aba se ainda há algo sem salvar
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (pending.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [])

  // Ao abrir: carrega do Supabase
  useEffect(() => {
    fetchAll().then(r => { cid.current = r.cid; setState(r.state) }).catch(e => setErr(e.message))
  }, [])

  // Depois de cada mudança do usuário, grava no banco (com espera de 0,8 s para agrupar digitação)
  useEffect(() => {
    if (!state || !dirty.current) return
    const v = version.current
    const t = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        let msg = ''
        try { msg = await push(cid.current, state) } catch (e) { msg = (e as Error).message || 'sem conexão' }
        setSaveErr(msg)
        if (!msg && version.current === v) pending.current = false
      })
    }, 800)
    return () => clearTimeout(t)
  }, [state])

  useEffect(() => { document.documentElement.classList.toggle('light', state ? !state.dark : false) }, [state?.dark])

  if (err) return <p className="p-8 text-red-400">{err}</p>
  if (!state) return <p className="p-8 text-zinc-400">Carregando ficha…</p>

  // set: toda alteração do usuário passa por aqui (marca "dirty" para disparar a gravação)
  const set = (fn: (s: AppState) => AppState) => { dirty.current = true; pending.current = true; version.current++; setState(s => (s ? fn(s) : s)) }
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
  return (
    <Context.Provider value={value}>
      {children}
      {saveErr && (
        <div role="alert" className="fixed bottom-4 right-4 z-[60] max-w-sm rounded-xl border border-red-500/50 bg-zinc-900 p-3 text-sm text-red-300">
          ⚠️ Não foi possível salvar: {saveErr}
        </div>
      )}
    </Context.Provider>
  )
}
