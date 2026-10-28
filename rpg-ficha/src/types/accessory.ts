// Equipamentos do personagem (armaduras, armas, acessórios...).
// O nome "Accessory" e a tabela "accessories" do banco foram mantidos para não exigir migração.
export interface Accessory {
  id: string; name: string; type: string; description: string; bonus: string
  resistances: string  // uma resistência por linha, ex.: "Frio +50%"
  image: string        // URL da imagem no Storage do Supabase
}

// Sugestões para o campo "Tipo" (aceita texto livre; adicione novos aqui)
export const EQUIPMENT_TYPES = ['Armadura', 'Arma', 'Escudo', 'Capacete', 'Botas', 'Luvas', 'Anel', 'Amuleto', 'Capa', 'Acessório']

// Ícone exibido no card conforme o tipo
export const equipmentIcon = (type: string) => {
  const t = type.toLowerCase()
  if (t.includes('arma') && !t.includes('armad')) return '⚔️'
  if (t.includes('armad') || t.includes('escudo') || t.includes('capacete')) return '🛡️'
  if (t.includes('anel') || t.includes('amuleto')) return '💍'
  if (t.includes('bota')) return '🥾'
  return '🧥'
}

export const newAccessory = (): Accessory => ({ id: crypto.randomUUID(), name: '', type: '', description: '', bonus: '', resistances: '', image: '' })
