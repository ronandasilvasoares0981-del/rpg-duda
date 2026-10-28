// Tudo o que a ficha guarda. Fica em uma única linha (jsonb) por usuário no Supabase.

export interface Entry { id: string; name: string; tag: string; description: string; image?: string } // equipamento, magia ou passiva (image é opcional: fichas antigas não têm)
export interface Ally { id: string; name: string; relation: string; notes: string; image: string }
export interface Chapter { id: string; title: string; text: string }
export interface Element { id: string; name: string }        // elemento do personagem (Fogo, Luz...)
export interface CustomAttr { id: string; label: string; value: number } // atributo criado pelo usuário
export interface Vital { cur: number; max: number }

export interface Sheet {
  image: string                        // foto do personagem (URL pública do Storage)
  player: string                       // nome de quem joga (diferente do nome do personagem)
  name: string; race: string; klass: string; level: number // klass = classe (class é palavra reservada)
  attrs: Record<string, number>        // Força, Defesa...
  vitals: Record<string, Vital>        // hp, mp, stamina, energy
  damage: number; armor: number
  elements: Element[]; customAttrs: CustomAttr[]
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

// Barras de status (cor da barra e do botão)
export const VITALS = [
  { k: 'hp', label: 'Vida (HP)', icon: '❤️', bar: 'bg-red-600', btn: 'bg-red-700 hover:bg-red-600' },
  { k: 'mp', label: 'Mana (MP)', icon: '🔮', bar: 'bg-blue-500', btn: 'bg-blue-700 hover:bg-blue-600' },
  { k: 'stamina', label: 'Estamina', icon: '🏃', bar: 'bg-green-500', btn: 'bg-green-700 hover:bg-green-600' },
  { k: 'energy', label: 'Energia', icon: '⚡', bar: 'bg-amber-500', btn: 'bg-amber-700 hover:bg-amber-600' },
] as const

export const defaultSheet = (): Sheet => ({
  image: '', player: '', name: '', race: '', klass: '', level: 0,
  attrs: {}, vitals: {}, damage: 0, armor: 0, elements: [], customAttrs: [],
  equipment: [], spells: [], passives: [], allies: [], lore: '', chapters: [],
})

// Junta o que veio do banco com os valores padrão (protege contra campos que faltam)
export function mergeSheet(d: Partial<Sheet>): Sheet {
  const b = defaultSheet()
  return { ...b, ...d, attrs: { ...b.attrs, ...d.attrs }, vitals: { ...b.vitals, ...d.vitals } }
}

export const vitalOf = (s: Sheet, k: string): Vital => s.vitals[k] ?? { cur: 0, max: 0 }
export const newId = () => crypto.randomUUID()
