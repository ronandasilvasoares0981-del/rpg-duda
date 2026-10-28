// Peças visuais reutilizáveis (Tailwind puro)
import { ReactNode, useId, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { BUCKET, supabase } from '../lib/supabase'

export const inputBase = 'rounded-lg border border-purple-500/30 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none transition focus:border-amber-400'
export const inputCls = `w-full ${inputBase}`
export const btnCls = 'inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-white transition hover:bg-purple-600'
export const btnSm = 'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white transition'

// Card padrão: cinza escuro, borda roxa suave, cantos arredondados
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`fade rounded-2xl border border-purple-500/30 bg-zinc-900 p-4 ${className}`}>{children}</div>
)

// Barra de progresso (HP vermelha, mana azul...)
export const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
    <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0}%` }} />
  </div>
)

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-sm text-zinc-400">{label}<div className="mt-1">{children}</div></label>
)
export const Txt = ({ label, value, onChange, area, rows = 2, placeholder }:
  { label: string; value: string; onChange: (v: string) => void; area?: boolean; rows?: number; placeholder?: string }) => (
  <Field label={label}>
    {area
      ? <textarea rows={rows} placeholder={placeholder} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
      : <input placeholder={placeholder} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />}
  </Field>
)
// Campo numérico: converte o texto digitado em número (zero aparece vazio, com "0" de dica)
export const Num = ({ value, onChange, className = inputCls, label }:
  { value: number; onChange: (n: number) => void; className?: string; label?: string }) => (
  <input type="number" inputMode="numeric" aria-label={label} placeholder="0" className={className}
    value={value || ''} onChange={e => onChange(Number(e.target.value) || 0)} />
)

// Reduz a imagem (lado maior 1200 px) antes de enviar, para a foto carregar rápido
async function shrink(file: File, side = 1200): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, side / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k))
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#09090b'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('Imagem inválida'))), 'image/jpeg', 0.87))
}

// Envia um JPEG já pronto para o Storage do Supabase (pasta com o id do usuário) e devolve a URL pública
export async function uploadBlob(blob: Blob): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  const path = `${user!.id}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Reduz a imagem escolhida pelo usuário e envia
export async function uploadImage(file: File): Promise<string> {
  return uploadBlob(await shrink(file))
}

// Espaço de foto com envio, troca e remoção (personagem e aliados)
export function PhotoBox({ src, onChange, className = '', label = 'Adicionar foto' }:
  { src: string; onChange: (url: string) => void; className?: string; label?: string }) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const pick = async (f?: File) => {
    if (!f) return
    setBusy(true); setErr('')
    try { onChange(await uploadImage(f)) }
    catch (e) { setErr((e as Error).message || 'Não foi possível enviar a foto.') }
    finally { setBusy(false) }
  }
  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-2xl border border-amber-400/50 bg-zinc-800 ${className}`}>
        {src
          ? <img src={src} alt="" className="h-full w-full object-cover" />
          : <label htmlFor={id} className="grid h-full w-full cursor-pointer place-items-center p-3 text-center text-zinc-500 transition hover:text-amber-400">
              <span className="flex flex-col items-center gap-2"><ImagePlus size={36} />{label}</span>
            </label>}
        {busy && <div className="absolute inset-0 grid place-items-center bg-black/70 text-amber-300">Enviando…</div>}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
        {src && <label htmlFor={id} className="cursor-pointer hover:text-amber-400">Trocar foto</label>}
        {src && <button className="hover:text-red-400" onClick={() => onChange('')}>Remover foto</button>}
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <input id={id} type="file" accept="image/*" className="sr-only" onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

// Botão de excluir usado nos cards (pede confirmação)
export const DeleteBtn = ({ onDelete, what = 'este item' }: { onDelete: () => void; what?: string }) => (
  <button aria-label="Excluir" className="p-1 text-zinc-400 transition hover:text-red-400"
    onClick={() => confirm(`Excluir ${what}?`) && onDelete()}><Trash2 size={18} /></button>
)
