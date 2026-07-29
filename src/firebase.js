import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, signInAnonymously } from 'firebase/auth'

// Config do Panella FC fixa no código (a apiKey do Firebase é pública, pode ficar
// no cliente). Nada de .env aqui — assim nenhum arquivo local sobrescreve com valor errado.
const cfg = {
  apiKey: 'AIzaSyCsr8mbCJTHx9FaHMDY_R91MXi_wnVDwt4',
  authDomain: 'panella-app.firebaseapp.com',
  projectId: 'panella-app',
  storageBucket: 'panella-app.firebasestorage.app',
  messagingSenderId: '150028665106',
  appId: '1:150028665106:web:c8b490401bfc15d6ff73cb',
}

// Senha da tela de entrada (pode trocar por .env, senão usa a padrão).
export const SENHA_PANELA = import.meta.env.VITE_SENHA_PANELA || 'panella2026'

// Config sempre presente agora — mantido por compatibilidade.
export const faltaConfig = !cfg.apiKey || !cfg.projectId

const app = initializeApp(cfg)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

export function entrarAnonimo() { return signInAnonymously(auth) }
export function garantirLogin() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)
  return signInAnonymously(auth) // placeholder — corrigido abaixo
}
