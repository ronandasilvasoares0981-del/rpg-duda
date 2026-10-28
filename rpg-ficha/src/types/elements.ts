// Elemento disponível para o personagem e para as magias (nome, ícone e cor).
// Antes era uma lista fixa no código; agora fica guardada no estado da
// aplicação, então o usuário pode adicionar e remover elementos pelo site.
export interface ElementDef { name: string; icon: string; cls: string }

// Paleta de cores pronta (classes do Tailwind). Como o CSS é gerado em
// tempo de build, um elemento novo só pode usar uma cor já presente no
// código — por isso o formulário escolhe entre estas, em vez de cor livre.
export const COLOR_PRESETS: { label: string; cls: string }[] = [
  { label: 'Laranja', cls: 'border-orange-400 text-orange-300' },
  { label: 'Amarelo', cls: 'border-yellow-300 text-yellow-200' },
  { label: 'Índigo', cls: 'border-indigo-400 text-indigo-300' },
  { label: 'Vermelho', cls: 'border-red-500 text-red-400' },
  { label: 'Cinza', cls: 'border-zinc-300 text-zinc-200' },
  { label: 'Roxo', cls: 'border-purple-400 text-purple-300' },
  { label: 'Verde', cls: 'border-emerald-400 text-emerald-300' },
  { label: 'Ciano', cls: 'border-cyan-400 text-cyan-300' },
  { label: 'Rosa', cls: 'border-pink-400 text-pink-300' },
  { label: 'Azul', cls: 'border-blue-400 text-blue-300' },
]

// Elementos iniciais da Elisa (mesmos de antes)
export const DEFAULT_ELEMENTS: ElementDef[] = [
  { name: 'Fogo', icon: '🔥', cls: COLOR_PRESETS[0].cls },
  { name: 'Luz', icon: '✨', cls: COLOR_PRESETS[1].cls },
  { name: 'Escuridão', icon: '🌑', cls: COLOR_PRESETS[2].cls },
  { name: 'Sangue', icon: '🩸', cls: COLOR_PRESETS[3].cls },
  { name: 'Selo', icon: '⛓️', cls: COLOR_PRESETS[4].cls },
  { name: 'Bardo', icon: '🎼', cls: COLOR_PRESETS[5].cls },
]
