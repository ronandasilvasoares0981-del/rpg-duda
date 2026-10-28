import ReactDOM from 'react-dom/client'
import App from './App'
import AuthGate from './components/AuthGate'
import { CharacterProvider } from './context/CharacterContext'
import { envOk } from './lib/supabase'
import './index.css'

// Aviso mostrado quando o arquivo .env não foi configurado
const EnvMissing = () => (
  <div className="grid min-h-screen place-items-center p-4">
    <div className="max-w-lg space-y-3 rounded-2xl border border-red-500/40 bg-zinc-900 p-6">
      <h1 className="text-2xl font-bold text-amber-400">⚠️ Supabase não configurado</h1>
      <p className="text-zinc-300">Crie um arquivo <code className="text-amber-300">.env</code> na raiz do projeto (veja o <code className="text-amber-300">.env.example</code>) com:</p>
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-3 text-sm text-zinc-300">{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-anon`}</pre>
      <p className="text-sm text-zinc-400">Depois reinicie o <code>npm run dev</code>. Se o site já está publicado, cadastre as mesmas variáveis no painel do host e faça um novo deploy.</p>
    </div>
  </div>
)

// AuthGate mostra o login; depois dele, o Provider carrega a ficha do Supabase
ReactDOM.createRoot(document.getElementById('root')!).render(
  envOk ? <AuthGate><CharacterProvider><App /></CharacterProvider></AuthGate> : <EnvMissing />
)
