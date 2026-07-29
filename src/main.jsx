import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Captura qualquer erro de render e mostra na tela (em vez de tela branca).
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { erro: null } }
  static getDerivedStateFromError(erro) { return { erro } }
  render() {
    if (this.state.erro) {
      return (
        <div style={{ maxWidth: 440, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#F3E9CC' }}>
          <h2 style={{ fontFamily: 'Anton, sans-serif' }}>Deu ruim ao carregar 😅</h2>
          <p style={{ color: '#8FA6C8' }}>Mensagem do erro (manda pro dev):</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#10233F', border: '1px solid #254272', borderRadius: 12, padding: 14, fontSize: 13 }}>
            {String(this.state.erro?.message || this.state.erro)}
          </pre>
          <p style={{ color: '#8FA6C8', fontSize: 13 }}>
            Dica: rode <b>npm run dev</b> e abra o endereço http://localhost:5173 que aparece no terminal
            (não abra o index.html direto). Confira também se o arquivo <b>.env</b> existe e está preenchido.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
