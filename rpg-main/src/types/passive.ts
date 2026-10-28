export interface Passive {
  id: string; name: string; category: string; description: string
  active: boolean   // true = habilidade Ativa, false = Passiva
  notes: string
}
export const newPassive = (): Passive => ({ id: crypto.randomUUID(), name: '', category: '', description: '', active: false, notes: '' })
