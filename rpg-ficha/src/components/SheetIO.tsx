// Backup da ficha: baixa a ficha em .json e restaura a partir de um .json
import { useId, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useSheet } from '../store'
import { exportSheet, parseSheet } from '../types'
import { Card, btnCls } from './ui'

const MAX_BYTES = 5 * 1024 * 1024

// "Aria Sombra" -> "aria-sombra"
const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function SheetIO() {
  const { sheet, update } = useSheet()
  const inputId = useId()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const exportar = () => {
    const blob = new Blob([JSON.stringify(exportSheet(sheet), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ficha-${slug(sheet.name) || 'personagem'}.json`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    setMsg({ ok: true, text: 'Ficha exportada.' })
  }

  const importar = async (f?: File) => {
    if (!f) return
    try {
      if (f.size > MAX_BYTES) throw new Error('Arquivo grande demais para ser uma ficha (limite de 5 MB).')
      let json: unknown
      try { json = JSON.parse(await f.text()) } catch { throw new Error('O arquivo não é um JSON válido.') }
      const nova = parseSheet(json)
      if (!confirm(`Importar "${nova.name || 'ficha sem nome'}"? Isso substitui TODA a ficha atual (a ficha atual será perdida se você não tiver um backup).`)) return
      update(() => nova)
      setMsg({ ok: true, text: `Ficha "${nova.name || 'sem nome'}" importada e salva.` })
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message })
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-2xl font-bold text-amber-400">💾 Backup da ficha</h2>
      <p className="text-sm text-zinc-400">Exporte a ficha para um arquivo .json ou restaure uma ficha a partir de um arquivo exportado antes.</p>
      <div className="flex flex-wrap gap-3">
        <button className={btnCls} onClick={exportar}><Download size={16} /> Exportar .json</button>
        <label htmlFor={inputId} className={`${btnCls} cursor-pointer`}><Upload size={16} /> Importar .json</label>
        <input id={inputId} type="file" accept="application/json,.json" className="sr-only"
          onChange={e => { importar(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
    </Card>
  )
}
