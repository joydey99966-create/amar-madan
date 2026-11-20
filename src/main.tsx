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

/**
 * Seed the published snapshot BEFORE the first render.
 *
 * The data services write their bundled demo seed into localStorage on first
 * read. If we render first and fetch the snapshot in the background, those
 * seeds occupy every key before applyPublished() can run, so admin-published
 * data would never reach a fresh visitor. The snapshot is a small same-origin
 * file, so awaiting it here is quick and guarantees the real data wins.
 */
dataSnapshotService.applyPublished().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
})

// Register Service Worker for PWA (base-aware for GitHub Pages).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const sw = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/sw.js`
    navigator.serviceWorker
      .register(sw)
      .then((registration) => console.log('SW registered:', registration.scope))
      .catch((error) => console.log('SW registration failed:', error))
  })
}
