// Dados principais do personagem (aba Ficha e Status)
export interface Character {
  name: string; player: string; race: string; klass: string // klass = classe (class é palavra reservada)
  level: number; age: number; height: string; weight: string
  elements: string[]                  // elementos exibidos como chips
  hp: number; hpMax: number           // vida atual / máxima
  san: number; sanMax: number         // sanidade atual / máxima
  image: string                       // imagem em base64 (upload)
  stats: Record<string, number>       // atributos: Força, Velocidade... (aceita novos)
  resources: Record<string, number>   // recursos: Pontos de Ação, Mana, Energia
}
