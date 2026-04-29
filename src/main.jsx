import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OwnerConsole from './OwnerConsole.jsx'

const isOwnerRoute = window.location.pathname.replace(/\/$/, '') === '/owner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isOwnerRoute ? <OwnerConsole /> : <App />}
  </StrictMode>,
)
