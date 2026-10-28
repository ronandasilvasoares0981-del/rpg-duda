// Peças visuais reutilizáveis (Tailwind puro; dá para trocar por shadcn/ui depois)
import { ReactNode } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const inputCls = 'w-full rounded-lg border border-purple-500/30 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none transition focus:border-amber-400'
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
export const Txt = ({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) => (
  <Field label={label}>
    {area
      ? <textarea rows={2} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
      : <input className={inputCls} value={value} onChange={e => onChange(e.target.value)} />}
  </Field>
)
// Campo numérico: converte o texto digitado em número
export const Num = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <input type="number" className={inputCls} value={value} onChange={e => onChange(Number(e.target.value) || 0)} />
)

// Envia a imagem para o Storage do Supabase e devolve a URL pública
export async function uploadImage(file: File | undefined, done: (url: string) => void) {
  if (!file) return
  const { data: { user } } = await supabase.auth.getUser()
  const path = `${user!.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
  const { error } = await supabase.storage.from('character-images').upload(path, file)
  if (error) return alert(error.message)
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
