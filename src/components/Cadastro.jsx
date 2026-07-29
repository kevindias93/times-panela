import { useState } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, auth, garantirLogin } from '../firebase'
import { POSICOES, ROTULO_POSICAO } from '../lib/sorteio'

// Se receber `jogador`, entra em modo edição (atualiza em vez de criar).
export default function Cadastro({ avulso = false, jogador = null, onPronto }) {
  const editando = !!jogador
  const [nome, setNome] = useState(jogador?.nome || '')
  const [posicao, setPosicao] = useState(jogador?.posicao || 'MEI')
  const [posicaoSecundaria, setPosSec] = useState(jogador?.posicaoSecundaria || '')
  const [habilidade, setHabilidade] = useState(jogador?.habVotos?.[auth.currentUser?.uid] || jogador?.habilidade || 3)
  const [arquivo, setArquivo] = useState(null)
  const [preview, setPreview] = useState(jogador?.fotoURL || '')
  const [salvando, setSalvando] = useState(false)

  function escolherFoto(e) {
    const f = e.target.files?.[0]; if (!f) return
    setArquivo(f); setPreview(URL.createObjectURL(f))
  }

  async function salvar() {
    if (!nome.trim() || salvando) return
    try { await garantirLogin() }
    catch (e) { alert('Não foi possível autenticar (Login Anônimo).\nCódigo: ' + (e?.code || '?') + '\n\nEm Authentication → Sign-in method, ative "Anônimo" e recarregue.'); return }
    if (posicaoSecundaria && posicaoSecundaria === posicao) { alert('A posição secundária precisa ser diferente da principal.'); return }
    setSalvando(true)
    try {
      let fotoURL = jogador?.fotoURL || ''
      if (arquivo) {
        const r = ref(storage, `fotos/${Date.now()}-${arquivo.name}`)
        await uploadBytes(r, arquivo)
        fotoURL = await getDownloadURL(r)
      }
      const meuUid = auth.currentUser?.uid || 'seed'
      const base = { nome: nome.trim(), posicao, posicaoSecundaria, fotoURL }
      if (editando) {
        await updateDoc(doc(db, 'jogadores', jogador.id), { ...base, [`habVotos.${meuUid}`]: habilidade })
      } else {
        await addDoc(collection(db, 'jogadores'), {
          ...base,
          habVotos: { [meuUid]: habilidade }, // sua nota inicial já entra como 1 voto
          avulso, jogos: 0, vitorias: 0, notaSoma: 0, notaQtd: 0,
          confirmado: avulso, criadoEm: serverTimestamp(),
        })
      }
      onPronto?.()
    } catch (e) {
      console.error(e)
      const cod = e?.code || ''
      let dica = ''
      if (cod.includes('permission-denied')) dica = '\n\nÉ regra do Firestore. Publique as regras liberando quem está autenticado.'
      else if (cod.includes('unauthenticated')) dica = '\n\nAtive o Login Anônimo em Authentication → Sign-in method.'
      else if (cod.startsWith('storage/')) dica = '\n\nÉ o Storage (a foto). Ative o Storage e publique as regras dele.'
      alert('Não deu pra salvar.\nCódigo: ' + (cod || 'desconhecido') + dica)
    } finally { setSalvando(false) }
  }

  return (
    <div className="form">
      <div className="field">
        <label>Nome</label>
        <input className="input" value={nome} onChange={(e) => setNome(e.target.value)}
          placeholder={avulso ? 'Nome do avulso' : 'Nome do jogador'} />
      </div>
      <div className="row">
        <div className="field">
          <label>Posição principal</label>
          <select value={posicao} onChange={(e) => setPosicao(e.target.value)}>
            {POSICOES.map((p) => <option key={p} value={p}>{ROTULO_POSICAO[p]}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Secundária</label>
          <select value={posicaoSecundaria} onChange={(e) => setPosSec(e.target.value)}>
            <option value="">Nenhuma</option>
            {POSICOES.map((p) => <option key={p} value={p}>{ROTULO_POSICAO[p]}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>{editando ? 'Sua avaliação (1 a 5)' : 'Sua nota inicial (a galera ajusta depois)'}</label>
        <div className="skill-pick">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={habilidade === n ? 'sel' : ''} onClick={() => setHabilidade(n)}>{n}</button>
          ))}
        </div>
        {editando && <p className="hint" style={{ textAlign: 'left', margin: '6px 0 0' }}>A estrela do jogador é a média de todas as avaliações; aqui você define/atualiza a <b>sua</b>. Também dá pra tocar direto nas estrelas na lista.</p>}
      </div>
      <div className="field">
        <label>Foto</label>
        <div className="foto-pick">
          {preview ? <img className="prev" src={preview} alt="prévia" /> : <div className="prev" />}
          <label className="file">{editando ? 'Trocar foto' : 'Escolher foto'}
            <input type="file" accept="image/*" onChange={escolherFoto} />
          </label>
        </div>
      </div>
      <button className="btn primary" onClick={salvar} disabled={salvando}>
        {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : avulso ? 'Adicionar avulso' : 'Cadastrar jogador'}
      </button>
      {editando && <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => onPronto?.()}>Cancelar</button>}
    </div>
  )
}
