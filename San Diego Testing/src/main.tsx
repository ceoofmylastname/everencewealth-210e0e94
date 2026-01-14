import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

// Global unhandled error tracking
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Log to server asynchronously
  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-server-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url_path: window.location.pathname,
      error_type: 'unhandled_rejection',
      error_message: event.reason?.message || String(event.reason),
      stack_trace: event.reason?.stack,
      user_agent: navigator.userAgent,
      metadata: { type: 'unhandledrejection' },
    }),
  }).catch(() => {});
});

window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-server-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url_path: window.location.pathname,
      error_type: 'unhandled_error',
      error_message: event.error?.message || event.message,
      stack_trace: event.error?.stack,
      user_agent: navigator.userAgent,
      metadata: { 
        type: 'window_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    }),
  }).catch(() => {});
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)