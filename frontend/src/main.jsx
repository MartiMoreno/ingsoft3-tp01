import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://5fc2b629b822ecf77ed98c046a5aa90c@o4512323356852224.ingest.us.sentry.io/4512323465641984',
  environment: window.location.hostname,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)