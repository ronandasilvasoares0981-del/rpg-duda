import { useId, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useSheet } from '../store'
import { backupFileName, buildBackup, parseBackup, uploadEmbeddedImages } from '../lib/backup'
import { Card, btnCls } from './ui'

// Exportar a ficha para um arquivo .json e importar de volta (backup ou envio para outra conta)
export default function BackupCard() {
  const { sheet, update } = useSheet()
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const exportar = async () => {
    setBusy(true); setMsg(null)
    try {
      const url = URL.createObjectURL(await buildBackup(sheet))
      const a = document.createElement('a')
      a.href = url; a.download = backupFileName(sheet)
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMsg({ ok: true, text: 'Ficha exportada. O arquivo foi baixado.' })
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || 'Não foi possível exportar.' }) }
    finally { setBusy(false) }
  }

  const importar = async (file?: File) => {
    if (!file || busy) return
    setBusy(true); setMsg(null)
    try {
      const incoming = parseBackup(await file.text())
      if (!confirm(`Importar "${incoming.name || 'ficha sem nome'}"? A ficha atual será SUBSTITUÍDA. Se quiser guardá-la, exporte antes.`)) return
      const { sheet: ready, failed } = await uploadEmbeddedImages(incoming)
      update(() => ready)
      setMsg({ ok: true, text: failed ? `Ficha importada, mas ${failed} imagem(ns) não puderam ser enviadas.` : 'Ficha importada com sucesso.' })
    } catch (e) { setMsg({ ok: false, text: (e as Error).message || 'Não foi possível importar.' }) }
    finally { setBusy(false) }
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-2xl font-bold text-amber-400">💾 Exportar e importar</h2>
      <p className="text-sm text-zinc-400">
        Baixe a ficha completa (com as fotos) em um arquivo para guardar ou enviar para outra conta. Importar substitui a ficha atual.
      </p>
      <div className="flex flex-wrap gap-2">
        <button className={`${btnCls} disabled:opacity-50`} disabled={busy} onClick={exportar}><Download size={18} />Exportar ficha</button>
        <label htmlFor={id} aria-disabled={busy}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-500/40 px-4 py-2 transition hover:bg-zinc-800 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
          <Upload size={18} />Importar ficha
        </label>
        <input id={id} type="file" accept=".json,application/json" className="sr-only" disabled={busy}
          onChange={e => { importar(e.target.files?.[0]); e.target.value = '' }} />
      </div>
      {busy && <p className="text-sm text-amber-300" role="status">Processando…</p>}
      {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`} role="status">{msg.text}</p>}
    </Card>
  )
}
