// Primeira tela do site: pede o nome do player (a pessoa que joga), diferente do nome do personagem.
// Só aparece enquanto a ficha não tiver nome de player; depois de preenchido, nunca mais.
import { FormEvent, useState } from 'react'
import { useSheet } from '../store'
import { Card, btnCls, inputCls } from './ui'

export default function PlayerNameGate() {
  const { update } = useSheet()
  const [name, setName] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) update(s => ({ ...s, player: name.trim() }))
  }
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm">
        <form className="space-y-3" onSubmit={submit}>
          <h1 className="text-3xl font-bold text-amber-400">📖 RPG DUDA</h1>
          <p className="text-zinc-300">Antes de começar: qual é o <b>seu nome</b>?</p>
          <p className="text-sm text-zinc-400">É o nome de quem joga (player), não o do personagem. Você poderá mudar depois na aba Ficha.</p>
          <input autoFocus className={inputCls} aria-label="Nome do player" placeholder="Seu nome" maxLength={60}
            value={name} onChange={e => setName(e.target.value)} />
          <button type="submit" disabled={!name.trim()} className={`${btnCls} w-full justify-center disabled:opacity-50`}>Continuar</button>
        </form>
      </Card>
    </div>
  )
}
