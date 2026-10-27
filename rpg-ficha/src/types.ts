// Tudo o que a ficha guarda. Fica em uma única linha (jsonb) por usuário no Supabase.

export interface Entry { id: string; name: string; tag: string; description: string } // equipamento, magia ou passiva
export interface Ally { id: string; name: string; relation: string; notes: string; image: string }
export interface Chapter { id: string; title: string; text: string }
export interface Vital { cur: number; max: number }
export interface Elemento { id: string; name: string; icon: string; level: number; notes: string } // afinidade elemental (Fogo, Água...)

export interface Sheet {
  image: string                        // foto do personagem (URL pública do Storage)
  name: string; race: string; klass: string; level: number // klass = classe (class é palavra reservada)
  attrs: Record<string, number>        // Força, Defesa...
  elements: Elemento[]                 // elementos do personagem (o usuário adiciona e remove)
  vitals: Record<string, Vital>        // hp, mp, stamina, energy
  damage: number; armor: number
  equipment: Entry[]; spells: Entry[]; passives: Entry[]
  allies: Ally[]
  lore: string; chapters: Chapter[]
}

// Para criar um novo atributo, basta acrescentar uma linha aqui
export const ATTRS = [
  { k: 'forca', label: 'Força' }, { k: 'defesa', label: 'Defesa' },
  { k: 'velocidade', label: 'Velocidade' }, { k: 'inteligencia', label: 'Inteligência' },
  { k: 'carisma', label: 'Carisma' }, { k: 'resistencia', label: 'Resistência' },
  { k: 'pontaria', label: 'Pontaria' }, { k: 'furtividade', label: 'Furtividade' },
] as const

// Elementos prontos para adicionar com um clique (o usuário também pode criar os seus)
export const ELEMENT_PRESETS = [
  { name: 'Fogo', icon: '🔥' }, { name: 'Água', icon: '💧' }, { name: 'Terra', icon: '🪨' }, { name: 'Ar', icon: '🌪️' },
  { name: 'Raio', icon: '⚡' }, { name: 'Gelo', icon: '❄️' }, { name: 'Natureza', icon: '🌿' }, { name: 'Luz', icon: '✨' },
  { name: 'Trevas', icon: '🌑' }, { name: 'Veneno', icon: '☠️' },
] as const

// Barras de status (cor da barra e do botão). pct: true = porcentagem (0 a 100 %, sem máximo editável)
export const VITALS = [
  { k: 'hp', label: 'Vida (HP)', icon: '❤️', bar: 'bg-red-600', btn: 'bg-red-700 hover:bg-red-600', pct: false },
  { k: 'mp', label: 'Mana (MP)', icon: '🔮', bar: 'bg-blue-500', btn: 'bg-blue-700 hover:bg-blue-600', pct: false },
  { k: 'stamina', label: 'Estamina', icon: '🏃', bar: 'bg-green-500', btn: 'bg-green-700 hover:bg-green-600', pct: false },
  { k: 'energy', label: 'Energia', icon: '⚡', bar: 'bg-amber-500', btn: 'bg-amber-700 hover:bg-amber-600', pct: true },
] as const

export const defaultSheet = (): Sheet => ({
  image: '', name: '', race: '', klass: '', level: 0,
  attrs: {}, elements: [], vitals: {}, damage: 0, armor: 0,
  equipment: [], spells: [], passives: [], allies: [], lore: '', chapters: [],
})

// Junta o que veio do banco com os valores padrão (protege contra campos que faltam)
export function mergeSheet(d: Partial<Sheet>): Sheet {
  const b = defaultSheet()
  return { ...b, ...d, attrs: { ...b.attrs, ...d.attrs }, vitals: { ...b.vitals, ...d.vitals } }
}

const PCT = new Set<string>(VITALS.filter(v => v.pct).map(v => v.k))
// Barras em porcentagem ficam sempre entre 0 e 100, com máximo fixo em 100
export const fixVital = (k: string, v: Vital): Vital => (PCT.has(k) ? { cur: Math.min(100, Math.max(0, v.cur)), max: 100 } : v)
export const vitalOf = (s: Sheet, k: string): Vital => fixVital(k, s.vitals[k] ?? { cur: 0, max: 0 })
export const newId = () => crypto.randomUUID()

// ---------------------------------------------------------------------------
// Import / export em .json
// ---------------------------------------------------------------------------
const FORMAT = 'grimorio-rpg-ficha'
const VERSION = 1

// Envelope do arquivo exportado: identifica o formato e guarda a ficha dentro de "sheet"
export const exportSheet = (s: Sheet) => ({ format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), sheet: s })

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}
const url = (v: unknown) => { const s = str(v).trim(); return /^https?:\/\//i.test(s) ? s : '' } // só links http(s)
const id = (v: unknown) => str(v) || newId()
const list = <T,>(v: unknown, f: (o: Record<string, unknown>) => T): T[] => (Array.isArray(v) ? v.filter(isObj).map(f) : [])
const entry = (o: Record<string, unknown>): Entry => ({ id: id(o.id), name: str(o.name), tag: str(o.tag), description: str(o.description) })

// Lê um arquivo importado (com envelope ou só a ficha) e devolve uma Sheet limpa.
// Lança Error com mensagem em português se o conteúdo não parecer uma ficha.
export function parseSheet(raw: unknown): Sheet {
  const r = isObj(raw) && isObj(raw.sheet) ? raw.sheet : raw
  if (!isObj(r)) throw new Error('O arquivo não contém uma ficha.')
  const campos = ['name', 'race', 'klass', 'level', 'attrs', 'elements', 'vitals', 'equipment', 'spells', 'passives', 'allies', 'lore', 'chapters']
  if (!campos.some(k => k in r)) throw new Error('Esse JSON não parece ser uma ficha deste site.')

  return mergeSheet({
    image: url(r.image),
    name: str(r.name), race: str(r.race), klass: str(r.klass), level: num(r.level),
    attrs: isObj(r.attrs) ? Object.fromEntries(Object.entries(r.attrs).map(([k, v]) => [k, num(v)])) : {},
    elements: list(r.elements, o => ({ id: id(o.id), name: str(o.name), icon: str(o.icon).slice(0, 8), level: num(o.level), notes: str(o.notes) })),
    vitals: isObj(r.vitals)
      ? Object.fromEntries(Object.entries(r.vitals).filter(([, v]) => isObj(v)).map(([k, v]) => [k, fixVital(k, { cur: num((v as Record<string, unknown>).cur), max: num((v as Record<string, unknown>).max) })]))
      : {},
    damage: num(r.damage), armor: num(r.armor),
    equipment: list(r.equipment, entry), spells: list(r.spells, entry), passives: list(r.passives, entry),
    allies: list(r.allies, o => ({ id: id(o.id), name: str(o.name), relation: str(o.relation), notes: str(o.notes), image: url(o.image) })),
    lore: str(r.lore),
    chapters: list(r.chapters, o => ({ id: id(o.id), title: str(o.title), text: str(o.text) })),
  })
}
