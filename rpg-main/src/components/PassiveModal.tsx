import { useState } from 'react'
import { useCharacter } from '../context/CharacterContext'
import { Passive } from '../types/passive'
import { Field, inputCls, Modal, Txt } from './ui'

export default function PassiveModal({ initial, onClose }: { initial: Passive; onClose: () => void }) {
  const { save } = useCharacter()
  const [f, setF] = useState(initial)
  const set = <K extends keyof Passive>(k: K, v: Passive[K]) => setF({ ...f, [k]: v })
  const submit = () => { if (!f.name.trim()) return; save('passives', f); onClose() }
  return (
    <Modal title={initial.name ? 'Editar passiva' : 'Adicionar passiva'} onClose={onClose} onSave={submit}>
      <Txt label="Nome" value={f.name} onChange={v => set('name', v)} />
      <Txt label="Categoria" value={f.category} onChange={v => set('category', v)} />
      <Field label="Tipo">
        <select className={inputCls} value={f.active ? 'a' : 'p'} onChange={e => set('active', e.target.value === 'a')}>
          <option value="p">Passiva</option><option value="a">Ativa</option>
        </select>
      </Field>
      <Txt label="Descrição" value={f.description} onChange={v => set('description', v)} area />
      <Txt label="Observações" value={f.notes} onChange={v => set('notes', v)} area />
    </Modal>
  )
}
