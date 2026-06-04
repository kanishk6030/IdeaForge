import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { library } from "@fortawesome/fontawesome-svg-core"
import { faComment, faThumbsUp } from "@fortawesome/free-regular-svg-icons"
import './index.css'
import App from './App.jsx'

library.add(faComment, faThumbsUp)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
