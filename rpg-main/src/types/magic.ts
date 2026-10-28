// O ícone/cor de cada elemento e a lista de elementos do personagem agora
// ficam em ../types/elements.ts, editáveis pelo usuário (aba Ficha).
// Sugestões de tipo de magia (o campo aceita texto livre; adicione novos aqui)
export const MAGIC_TYPES = ['Ataque', 'Defesa', 'Suporte', 'Ilusão', 'Materialização', 'Selo']

export interface Magic {
  id: string; name: string; type: string; element: string; description: string
  range: string; duration: string; effects: string; penalty: string; cooldown: string
}
export const newMagic = (): Magic => ({
  id: crypto.randomUUID(), name: '', type: '', element: 'Fogo', description: '',
  range: '', duration: '', effects: '', penalty: '', cooldown: '',
})
