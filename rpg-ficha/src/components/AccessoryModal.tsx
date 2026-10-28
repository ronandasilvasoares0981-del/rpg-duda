import { useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useCharacter } from '../context/CharacterContext'
import { Accessory } from '../types/accessory'
import { Field, Modal, uploadImage, Txt } from './ui'

const MAX_MB = 5

export default function AccessoryModal({ initial, onClose }: { initial: Accessory; onClose: () => void }) {
  const { save } = useCharacter()
  const [f, setF] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const set = (k: keyof Accessory, v: string) => setF(prev => ({ ...prev, [k]: v }))

  // Salvar só é permitido depois que o envio da imagem terminar
  const submit = () => {
    if (!f.name.trim() || uploading) return
    save('accessories', f)
    onClose()
  }

  const onPick = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Escolha um arquivo de imagem.')
    if (file.size > MAX_MB * 1024 * 1024) return alert(`A imagem deve ter no máximo ${MAX_MB} MB.`)
    setUploading(true)
    await uploadImage(file, url => set('image', url))
    setUploading(false)
  }

  return (
    <Modal title={initial.name ? 'Editar acessório' : 'Novo acessório'} onClose={onClose} onSave={submit}>
      <Txt label="Nome" value={f.name} onChange={v => set('name', v)} />
      <Txt label="Tipo" value={f.type} onChange={v => set('type', v)} />
      <Txt label="Descrição" value={f.description} onChange={v => set('description', v)} area />
      <Txt label="Bônus" value={f.bonus} onChange={v => set('bonus', v)} />
      <Txt label="Resistências (uma por linha, ex.: Frio +50%)" value={f.resistances} onChange={v => set('resistances', v)} area />

      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Imagem do equipamento</p>
        {f.image && (
          <div className="relative">
            <img src={f.image} alt="Pré-visualização" className="h-40 w-full rounded-xl border border-purple-500/30 bg-zinc-950 object-contain" />
            <button type="button" aria-label="Remover imagem" onClick={() => set('image', '')}
              className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-zinc-300 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-500/40 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
          <ImagePlus size={16} />
          {uploading ? 'Enviando…' : f.image ? 'Trocar imagem' : 'Escolher imagem'}
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => { onPick(e.target.files?.[0]); e.target.value = '' }} />
        </label>
      </div>
    </Modal>
  )
}
