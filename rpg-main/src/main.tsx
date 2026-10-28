import ReactDOM from 'react-dom/client'
import App from './App'
import AuthGate from './components/AuthGate'
import { CharacterProvider } from './context/CharacterContext'
import './index.css'

// AuthGate mostra o login; depois dele, o Provider carrega a ficha do Supabase
ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthGate><CharacterProvider><App /></CharacterProvider></AuthGate>
)
