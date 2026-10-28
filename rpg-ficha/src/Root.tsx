// Decide o que mostrar depois do login:
//  - player comum: vai direto para a própria ficha (como antes)
//  - mestre: vê o painel com "Minha ficha" e "Fichas dos players"
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { SheetProvider } from './store'
import App from './App'
import { ListaPlayers, Painel } from './pages/Mestre'

type View =
  | { k: 'painel' }
  | { k: 'players' }
  | { k: 'own' }
  | { k: 'player'; id: string }

export default function Root() {
  const [me, setMe] = useState<{ id: string; master: boolean } | null>(null)
  const [view, setView] = useState<View>({ k: 'painel' })

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Se a tabela de mestres não existir ainda (SQL não rodado) ou der erro, trata como player comum
      const { data, error } = await supabase.from('rpg_mestres').select('user_id').eq('user_id', user.id).maybeSingle()
      setMe({ id: user.id, master: !error && !!data })
    })()
  }, [])

  if (!me) return <p className="p-8 text-zinc-400">Carregando…</p>

  if (!me.master) return <SheetProvider userId={me.id}><App /></SheetProvider>

  const painel = () => setView({ k: 'painel' })
  switch (view.k) {
    case 'painel': return <Painel onOwn={() => setView({ k: 'own' })} onPlayers={() => setView({ k: 'players' })} />
    case 'players': return <ListaPlayers myId={me.id} onBack={painel} onOpen={id => setView({ k: 'player', id })} />
    case 'own': return <SheetProvider key={me.id} userId={me.id}><App onBack={painel} /></SheetProvider>
    // Da ficha de um player, voltar leva à lista de players; de lá se volta ao painel
    case 'player': return <SheetProvider key={view.id} userId={view.id}><App doPlayer onBack={() => setView({ k: 'players' })} /></SheetProvider>
  }
}
