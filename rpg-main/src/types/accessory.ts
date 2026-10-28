export interface Accessory {
  id: string; name: string; type: string; description: string; bonus: string
  resistances: string  // uma resistência por linha, ex.: "Frio +50%"
  image: string        // base64
}
export const newAccessory = (): Accessory => ({ id: crypto.randomUUID(), name: '', type: '', description: '', bonus: '', resistances: '', image: '' })
