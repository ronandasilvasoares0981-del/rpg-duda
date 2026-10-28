// Peças visuais reutilizáveis (Tailwind puro; dá para trocar por shadcn/ui depois)
import { ReactNode, useState } from 'react'
import { ImagePlus, Pencil, Trash2, User, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

// inputBase = estilo do campo SEM largura (para campos lado a lado); inputCls = campo de largura total
export const inputBase = 'rounded-lg border border-purple-500/30 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none transition focus:border-amber-400'
export const inputCls = `w-full ${inputBase}`
export const btnCls = 'inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2 text-white transition hover:bg-purple-600'

// Card padrão: cinza escuro, borda roxa suave, cantos arredondados
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`fade rounded-2xl border border-purple-500/30 bg-zinc-900 p-4 ${className}`}>{children}</div>
)

// Barra de progresso (HP vermelha / Sanidade azul)
export const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
    <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0}%` }} />
  </div>
)

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block text-sm text-zinc-400">{label}<div className="mt-1">{children}</div></label>
)
export const Txt = ({ label, value, onChange, area, placeholder, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string; rows?: number
}) => (
  <Field label={label}>
    {area
      ? <textarea rows={rows} placeholder={placeholder} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
      : <input placeholder={placeholder} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />}
  </Field>
)
// Campo numérico: converte o texto digitado em número
export const Num = ({ value, onChange, label, className = inputCls }: {
  value: number; onChange: (n: number) => void; label?: string; className?: string
}) => (
  <input type="number" aria-label={label} className={className} value={value} onChange={e => onChange(Number(e.target.value) || 0)} />
)

// Envia a imagem para o Storage do Supabase e devolve a URL pública
export async function uploadImage(file: File | undefined, done: (url: string) => void) {
  if (!file) return
  if (!file.type.startsWith('image/')) return alert('Escolha um arquivo de imagem.')
  if (file.size > 5 * 1024 * 1024) return alert('A imagem deve ter no máximo 5 MB.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return alert('Sua sessão expirou. Entre novamente para enviar imagens.')
  const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase.storage.from('character-images').upload(path, file)
  if (error) return alert(`Não foi possível enviar a imagem: ${error.message}`)
  done(supabase.storage.from('character-images').getPublicUrl(path).data.publicUrl)
}

// Botões de editar / excluir usados nos cards
export const Actions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex gap-3 text-zinc-400">
    <button aria-label="Editar" className="hover:text-amber-400" onClick={onEdit}><Pencil size={16} /></button>
    <button aria-label="Excluir" className="hover:text-red-400" onClick={() => confirm('Excluir este item?') && onDelete()}><Trash2 size={16} /></button>
  </div>
)

// Modal genérico usado pelos 3 modais (Magia, Passiva, Acessório)
export function Modal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="fade max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl border border-purple-500/40 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-400">{title}</h2>
          <button aria-label="Fechar" onClick={onClose}><X /></button>
        </div>
        {children}
        <button className={btnCls} onClick={onSave}>Salvar</button>
      </div>
    </div>
  )
}

// Botão de lixeira com confirmação ("what" = nome do que será excluído)
export const DeleteBtn = ({ what, onDelete }: { what: string; onDelete: () => void }) => (
  <button type="button" aria-label={`Excluir ${what}`} className="shrink-0 p-2 text-zinc-400 transition hover:text-red-400"
    onClick={() => confirm(`Excluir ${what}?`) && onDelete()}>
    <Trash2 size={16} />
  </button>
)

// Caixa de foto: mostra a imagem (ou um espaço vazio) e deixa escolher/trocar a foto clicando nela
export function PhotoBox({ src, onChange, className = '', label = 'Foto' }: {
  src: string; onChange: (url: string) => void; className?: string; label?: string
}) {
  const [busy, setBusy] = useState(false)
  const pick = async (f?: File) => { setBusy(true); await uploadImage(f, onChange); setBusy(false) }
  return (
    <label className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-purple-500/30 bg-zinc-950 ${className}`}>
      {src
        ? <img src={src} alt={label} className="h-full w-full object-cover" />
        : <span className="flex flex-col items-center gap-1 text-sm text-zinc-500"><User size={32} />{label}</span>}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 text-xs text-zinc-200 opacity-0 transition group-hover:opacity-100">
        <ImagePlus size={14} /> {busy ? 'Enviando…' : src ? 'Trocar foto' : 'Escolher foto'}
      </span>
      <input type="file" accept="image/*" className="sr-only" disabled={busy}
        onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />
    </label>
  )
}
