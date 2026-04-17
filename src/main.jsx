import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Capture beforeinstallprompt before React mounts (avoids race condition)
window.__installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__installPrompt = e;
});

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#07080C', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌙</div>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 24, textAlign: 'center' }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', cursor: 'pointer' }}>
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
