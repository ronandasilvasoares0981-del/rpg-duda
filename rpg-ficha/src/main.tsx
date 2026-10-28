import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthGate from './components/AuthGate'
import Root from './Root'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthGate>
      <Root />
    </AuthGate>
  </React.StrictMode>,
)
