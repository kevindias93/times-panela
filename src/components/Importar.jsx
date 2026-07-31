import { useState } from 'react'
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db, auth, garantirLogin } from '../firebase'

// Jogadores do Panella FC (nome + vitórias da imagem). Posição entra como MEI;
// é só ajustar depois no ✎ de cada um.
const JOGADORES = [
  ['Diego', 0], ['Rafael Ferreira', 0], ['José', 0], ['Vinicius', 0], ['Moises', 0],
  ['Marcelo', 0], ['João', 0], ['Fructo', 0], ['Michael', 0], ['Renan', 0],
  ['Timello', 0], ['Edu', 0], ['Rafinha', 0], ['Amauri', 0], ['Markim', 0],
  ['Pedro', 0], ['Japa', 0], ['Britto', 0], ['Danilo', 0], ['Lezim', 0],
  ['Mario', 0], ['Kevin', 0], ['Eder', 0], ['Fabio', 0], ['Gui', 0],
]

export default function Importar({ existentes = [], onPronto }) {
  const [salvando, setSalvando] = useState(false)

  async function adicionar() {
    if (salvando) return
    try { await garantirLogin() }
    catch (e) { alert('Não foi possível autenticar.\nCódigo: ' + (e?.code || '?')); return }
    const jaTem = new Set(existentes.map((j) => (j.nome || '').trim().toLowerCase()))
    const novos = JOGADORES.filter(([nome]) => !jaTem.has(nome.toLowerCase()))
    if (!novos.length) { alert('Todos esses jogadores já estão cadastrados.'); onPronto?.(); return }

    setSalvando(true)
    try {
      const uid = auth.currentUser.uid
      const batch = writeBatch(db)
      novos.forEach(([nome, vit]) => {
        batch.set(doc(collection(db, 'jogadores')), {
          nome, posicao: 'MEI', posicaoSecundaria: '', fotoURL: '',
          habVotos: { [uid]: 3 }, avulso: false, jogos: 0, vitorias: vit,
          notaSoma: 0, notaQtd: 0, confirmado: false, criadoEm: serverTimestamp(),
        })
      })
      await batch.commit()
      alert(`Adicionados ${novos.length} jogadores! Agora é só ajustar as posições (goleiros, zagueiros, atacantes) no ✎ de cada um.`)
      onPronto?.()
    } catch (e) {
      console.error(e)
      const perm = String(e?.code || '').includes('permission')
      alert('Não deu pra adicionar.\nCódigo: ' + (e?.code || '?') + (perm ? '\n\nPublique as regras do Firestore (coleção jogadores).' : ''))
    } finally { setSalvando(false) }
  }

  return (
    <div className="form">
      <p className="hint" style={{ textAlign: 'left', margin: '0 0 12px' }}>
        Adiciona os <b>{JOGADORES.length} jogadores do Panella</b> de uma vez (com as vitórias da imagem).
        Todos entram como meia — depois você acerta as posições pelo ✎. Quem já existe é ignorado.
      </p>
      <button className="btn primary" onClick={adicionar} disabled={salvando}>
        {salvando ? 'Adicionando…' : `Adicionar ${JOGADORES.length} jogadores`}
      </button>
      <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => onPronto?.()}>Cancelar</button>
    </div>
  )
}
