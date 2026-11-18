import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { dataSnapshotService } from './services/dataSnapshotService'

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
