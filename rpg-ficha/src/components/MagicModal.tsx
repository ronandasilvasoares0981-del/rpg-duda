import { useState } from 'react'
import { useCharacter } from '../context/CharacterContext'
import { Magic, MAGIC_TYPES } from '../types/magic'
import { Field, inputCls, Modal, Txt } from './ui'

// Modal de criar/editar magia. `initial` é a magia (nova em branco ou existente)
export default function MagicModal({ initial, onClose }: { initial: Magic; onClose: () => void }) {
  const { state, save } = useCharacter()
  // Se o elemento da magia não existe mais na lista (foi removido), usa o primeiro disponível
  const [f, setF] = useState<Magic>(() => state.elementDefs.some(d => d.name === initial.element)
    ? initial : { ...initial, element: state.elementDefs[0]?.name ?? '' }) // cópia local do formulário
  const set = (k: keyof Magic, v: string) => setF({ ...f, [k]: v })
  const txt = (k: keyof Magic, label: string, area = false) => <Txt label={label} value={f[k]} onChange={v => set(k, v)} area={area} />
  const submit = () => { if (!f.name.trim()) return; save('magics', f); onClose() }
  return (
    <Modal title={initial.name ? 'Editar magia' : 'Nova magia'} onClose={onClose} onSave={submit}>
      {txt('name', 'Nome')}
      <Field label="Tipo">
        <input list="tipos" className={inputCls} value={f.type} onChange={e => set('type', e.target.value)} />
        <datalist id="tipos">{MAGIC_TYPES.map(t => <option key={t} value={t} />)}</datalist>
      </Field>
      <Field label="Elemento">
        <select className={inputCls} value={f.element} onChange={e => set('element', e.target.value)}>
          {state.elementDefs.map(d => <option key={d.name} value={d.name}>{d.icon} {d.name}</option>)}
        </select>
      </Field>
      {txt('description', 'Descrição', true)}
      {txt('range', 'Alcance')}
      {txt('duration', 'Duração')}
      {txt('effects', 'Efeitos', true)}
      {txt('penalty', 'Penalidade')}
      {txt('cooldown', 'Cooldown')}
    </Modal>
  )
}
