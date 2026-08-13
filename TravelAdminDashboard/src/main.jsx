import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FeedbackProvider from './components/feedback/FeedbackProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bildirim ve onay diyaloğu tüm ağaç için burada sağlanıyor. */}
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </StrictMode>,
)
