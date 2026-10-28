// Exportar / importar a ficha como arquivo .json
// As fotos vão DENTRO do arquivo (data URL), então a ficha pode ir para outra conta sem perder as imagens.
// Ao importar, as fotos embutidas são reenviadas para o Storage da conta atual.
import { uploadBlob } from '../components/ui'
import { Entry, Sheet, newId } from '../types'

const APP = 'grimorio-rpg'
const VERSION = 1

// ---------- Limpeza do que vem de fora (o arquivo pode ter sido editado à mão) ----------
type Obj = Record<string, unknown>
const rec = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})
const list = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(x => x && typeof x === 'object' && !Array.isArray(x)) as Obj[] : [])
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
// Só aceita imagem embutida ou link http(s); qualquer outra coisa vira "sem foto"
const img = (v: unknown) => { const s = str(v).trim(); return /^(data:image\/|https?:\/\/)/i.test(s) ? s : '' }

const entries = (v: unknown): Entry[] =>
  list(v).map(e => ({ id: newId(), name: str(e.name), tag: str(e.tag), description: str(e.description), image: img(e.image) }))

export function normalizeSheet(raw: unknown): Sheet {
  const r = rec(raw)
  return {
    image: img(r.image),
    name: str(r.name), race: str(r.race), klass: str(r.klass), level: num(r.level),
    attrs: Object.fromEntries(Object.entries(rec(r.attrs)).map(([k, v]) => [k, num(v)])),
    vitals: Object.fromEntries(Object.entries(rec(r.vitals)).map(([k, v]) => [k, { cur: num(rec(v).cur), max: num(rec(v).max) }])),
    damage: num(r.damage), armor: num(r.armor),
    equipment: entries(r.equipment), spells: entries(r.spells), passives: entries(r.passives),
    allies: list(r.allies).map(a => ({ id: newId(), name: str(a.name), relation: str(a.relation), notes: str(a.notes), image: img(a.image) })),
    lore: str(r.lore),
    chapters: list(r.chapters).map(c => ({ id: newId(), title: str(c.title), text: str(c.text) })),
  }
}

// Lê o texto do arquivo e devolve a ficha limpa. Lança Error com mensagem em português se não servir.
export function parseBackup(text: string): Sheet {
  let data: unknown
  try { data = JSON.parse(text) } catch { throw new Error('O arquivo não é um JSON válido.') }
  const root = rec(data)
  if (num(root.version) > VERSION) throw new Error('Este arquivo foi criado por uma versão mais nova do site.')
  const src = 'sheet' in root ? root.sheet : data // aceita também um objeto de ficha "puro"
  const s = rec(src)
  const known = ['name', 'attrs', 'vitals', 'equipment', 'spells', 'passives', 'allies', 'lore', 'chapters']
  if (!known.some(k => k in s)) throw new Error('Este arquivo não parece ser uma ficha do Grimório.')
  return normalizeSheet(src)
}

// ---------- Trocar todas as imagens da ficha por outra coisa (URL → data URL, data URL → URL) ----------
async function mapImages(s: Sheet, fn: (url: string) => Promise<string>): Promise<Sheet> {
  const cache = new Map<string, Promise<string>>() // a mesma imagem só é processada uma vez
  const go = (u?: string) => {
    if (!u) return Promise.resolve('')
    if (!cache.has(u)) cache.set(u, fn(u))
    return cache.get(u)!
  }
  const ents = (l: Entry[]) => Promise.all(l.map(async e => ({ ...e, image: await go(e.image) })))
  const [image, equipment, spells, passives, allies] = await Promise.all([
    go(s.image), ents(s.equipment), ents(s.spells), ents(s.passives),
    Promise.all(s.allies.map(async a => ({ ...a, image: await go(a.image) }))),
  ])
  return { ...s, image, equipment, spells, passives, allies }
}

const toDataUrl = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(r.result as string)
  r.onerror = () => rej(r.error)
  r.readAsDataURL(b)
})

// ---------- Exportar ----------
export async function buildBackup(sheet: Sheet): Promise<Blob> {
  const embedded = await mapImages(sheet, async url => {
    if (url.startsWith('data:')) return url
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(String(resp.status))
      return await toDataUrl(await resp.blob())
    } catch { return url } // não conseguiu baixar: mantém o link original
  })
  const body = { app: APP, version: VERSION, exportedAt: new Date().toISOString(), sheet: embedded }
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' })
}

export function backupFileName(sheet: Sheet): string {
  const slug = sheet.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `ficha-${slug || 'personagem'}-${new Date().toISOString().slice(0, 10)}.json`
}

// ---------- Importar: reenvia as fotos embutidas para o Storage da conta atual ----------
export async function uploadEmbeddedImages(sheet: Sheet): Promise<{ sheet: Sheet; failed: number }> {
  let failed = 0
  const result = await mapImages(sheet, async url => {
    if (!url.startsWith('data:')) return url // link normal: mantém
    try { return await uploadBlob(await (await fetch(url)).blob()) }
    catch { failed++; return '' }
  })
  return { sheet: result, failed }
}
