import { useState } from 'react'
import { useCharacter } from '../context/CharacterContext'
import StatusCard from '../components/StatusCard'
import { btnCls, inputCls } from '../components/ui'

export default function Status() {
  const { state: { character: c }, setStat, setResource, setCharacter } = useCharacter()
  const [novo, setNovo] = useState('') // nome de um novo atributo
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-3xl font-bold text-amber-400">📊 Atributos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(c.stats).map(([k, v]) => <StatusCard key={k} name={k} value={v} onChange={n => setStat(k, n)} />)}
        </div>
        <div className="mt-3 flex gap-2">
          <input className={inputCls} placeholder="Novo atributo" value={novo} onChange={e => setNovo(e.target.value)} />
          <button className={btnCls} onClick={() => {
            const nome = novo.trim()
            if (!nome) return
            if (nome in c.stats) return alert('Esse atributo já existe.') // senão o valor atual seria zerado
            setStat(nome, 0); setNovo('')
          }}>Adicionar</button>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-3xl font-bold text-amber-400">Recursos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(c.resources).map(([k, v]) => <StatusCard key={k} name={k} value={v} onChange={n => setResource(k, n)} />)}
          <StatusCard name="Vida" value={c.hp} onChange={n => setCharacter({ hp: n })} />
          <StatusCard name="🧠 Sanidade" value={c.san} max={c.sanMax} barColor="bg-blue-500" onChange={n => setCharacter({ san: Math.max(0, Math.min(c.sanMax, n)) })} />
        </div>
      </section>
    </div>
  )
}
