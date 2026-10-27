import { Minus, Plus } from 'lucide-react'
import { useSheet } from '../store'
import { ATTRS, Sheet, VITALS, Vital, vitalOf } from '../types'
import { Bar, Card, Field, Num, PhotoBox, Txt, btnSm, inputBase } from '../components/ui'

// Linha de uma barra de status: botões -1/+1, valor atual / máximo e a barra
function VitalEditor({ def, v, onChange }: { def: (typeof VITALS)[number]; v: Vital; onChange: (p: Partial<Vital>) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="mr-auto text-sm">{def.icon} {def.label}</span>
        <button aria-label={`Diminuir ${def.label}`} className={`${btnSm} ${def.btn}`} onClick={() => onChange({ cur: Math.max(0, v.cur - 1) })}><Minus size={14} /></button>
        <Num label={`${def.label} atual`} value={v.cur} onChange={n => onChange({ cur: n })} className={`${inputBase} w-20 text-center`} />
        <span className="text-zinc-500">/</span>
        <Num label={`${def.label} máximo`} value={v.max} onChange={n => onChange({ max: n })} className={`${inputBase} w-20 text-center`} />
        <button aria-label={`Aumentar ${def.label}`} className={`${btnSm} ${def.btn}`} onClick={() => onChange({ cur: v.cur + 1 })}><Plus size={14} /></button>
      </div>
      <Bar value={v.cur} max={v.max} color={def.bar} />
    </div>
  )
}

export default function Ficha() {
  const { sheet: s, update } = useSheet()
  const set = <K extends keyof Sheet>(k: K, v: Sheet[K]) => update(p => ({ ...p, [k]: v }) as Sheet)
  const setAttr = (k: string, n: number) => update(p => ({ ...p, attrs: { ...p.attrs, [k]: n } }))
  const setVital = (k: string, patch: Partial<Vital>) =>
    update(p => ({ ...p, vitals: { ...p.vitals, [k]: { ...vitalOf(p, k), ...patch } } }))

  return (
    <div className="space-y-4">
      {/* Cabeçalho: foto, nome, nível/raça/classe e barras */}
      <Card className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <PhotoBox src={s.image} onChange={u => set('image', u)} className="h-64 w-48" label="Foto do personagem" />
        <div className="w-full min-w-0 flex-1 space-y-2">
          <p className="text-sm text-zinc-400">📖 Ficha de Personagem</p>
          <h1 className="break-words text-4xl font-bold text-amber-400">{s.name || 'Sem nome'}</h1>
          <p className="text-zinc-300">{[s.level ? `Nível ${s.level}` : '', s.race, s.klass].filter(Boolean).join(' • ') || 'Preencha as informações abaixo'}</p>
          {VITALS.map(d => {
            const v = vitalOf(s, d.k)
            return (
              <div key={d.k} className="space-y-1">
                <p className="text-sm">{d.icon} {d.label} {v.cur} / {v.max}</p>
                <Bar value={v.cur} max={v.max} color={d.bar} />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-amber-400">📋 Informações</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Txt label="Nome" value={s.name} onChange={v => set('name', v)} />
          <Txt label="Raça" value={s.race} onChange={v => set('race', v)} />
          <Txt label="Classe" value={s.klass} onChange={v => set('klass', v)} />
          <Field label="Nível"><Num value={s.level} onChange={n => set('level', n)} /></Field>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold text-amber-400">⚔️ Atributos</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ATTRS.map(a => (
            <div key={a.k} className="rounded-xl border border-purple-500/30 bg-zinc-950 p-3">
              <label className="block text-sm text-zinc-400" htmlFor={`attr-${a.k}`}>{a.label}</label>
              <input id={`attr-${a.k}`} type="number" inputMode="numeric" placeholder="0"
                className="mt-1 w-full bg-transparent text-3xl font-bold text-amber-400 outline-none"
                value={s.attrs[a.k] || ''} onChange={e => setAttr(a.k, Number(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-2xl font-bold text-amber-400">❤️ Status</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {VITALS.map(d => <VitalEditor key={d.k} def={d} v={vitalOf(s, d.k)} onChange={p => setVital(d.k, p)} />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dano"><Num value={s.damage} onChange={n => set('damage', n)} /></Field>
          <Field label="Armadura"><Num value={s.armor} onChange={n => set('armor', n)} /></Field>
        </div>
      </Card>
    </div>
  )
}
