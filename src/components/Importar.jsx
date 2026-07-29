import { useState } from 'react'
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db, auth, garantirLogin } from '../firebase'

// Jogadores do Panella FC (nome + vitórias da imagem). Posição entra como MEI;
// é só ajustar depois no ✎ de cada um.
const JOGADORES = [
  ['Diego', 9], ['Rafael', 8], ['José', 7], ['Vinicius', 7], ['Moises', 7],
  ['Marcelo', 6], ['João', 6], ['Fructo', 6], ['Michael', 5], ['Renan', 5],
  ['Timello', 5], ['Edu', 5], ['Rafinha', 5], ['Amauri', 4], ['Markin', 4],
  ['Pedro', 4], ['Japa', 4], ['Britto', 3], ['Danilo', 3], ['Lezim', 3],
  ['Mario', 3], ['Kevin', 2], ['Eder', 1], ['Fabio', 1], ['Gui', 1],
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
