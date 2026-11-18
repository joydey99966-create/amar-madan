import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { dataSnapshotService } from './services/dataSnapshotService'

// Restore a deep link that arrived via the 404.html SPA fallback on GitHub
// Pages. The 404 page encodes the original path as ?p=; put it back in the URL
// before the router reads it, then drop the helper param.
function restoreDeepLink() {
  const params = new URLSearchParams(location.search)
  const encoded = params.get('p')
  if (!encoded) return
  params.delete('p')
  const rest = params.toString()
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const target = `${base}${encoded}${rest ? `?${rest}` : ''}`
  window.history.replaceState({}, '', target)
}
restoreDeepLink()

// Seed an empty browser from a published snapshot before the app renders, so
// admin-published data reaches every visitor on a static host. A short timeout
// guarantees first paint is never blocked by a slow or missing file.
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(undefined as T), ms))])

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

withTimeout(dataSnapshotService.applyPublished(), 1500).finally(renderApp)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => console.log('SW registered:', registration.scope))
      .catch((error) => console.log('SW registration failed:', error))
  })
}
