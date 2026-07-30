import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, limit, updateDoc, deleteDoc, setDoc, writeBatch } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth, entrarAnonimo, garantirLogin, faltaConfig, SENHA_PANELA } from './firebase'
import Cadastro from './components/Cadastro'
import Escalacao from './components/Escalacao'
import Ranking from './components/Ranking'
import PeDeRato from './components/PeDeRato'
import EncerrarPartida from './components/EncerrarPartida'
import Historico from './components/Historico'
import Importar from './components/Importar'
import CardPremio from './components/CardPremio'
import { IconPresenca, IconTimes, IconRanking, IconPremio, IconHistorico } from './components/Icons'
import { sortearTimes, maxTimes, faltando, ROTULO_POSICAO, mediaHab, qtdHab } from './lib/sorteio'
import logo from './assets/logo.png'

const SORTEIO_REF = doc(db, 'estado', 'sorteio')
const VOTACAO_REF = doc(db, 'estado', 'votacao')

function iniciais(n) { return n.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') }
const CORES = { GOL: '#E0A64B', ZAG: '#3C74C9', MEI: '#35A85B', ATA: '#D2352E' }
function Estrelas({ j, uid, onVote }) {
  const media = mediaHab(j)
  const cheia = Math.round(media)
  const meu = j.habVotos?.[uid]
  const q = qtdHab(j)
  return (
    <span className="rate" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} className={'star' + (n <= cheia ? ' on' : '') + (meu === n ? ' meu' : '')}
          onClick={() => onVote(j, n)} title="Toque pra avaliar">★</button>
      ))}
      <span className="rate-info">{q ? `${media.toFixed(1)} · ${q} aval.` : 'sem nota'}{meu ? ` · você ${meu}` : ''}</span>
    </span>
  )
}

function Gate({ onOk }) {
  const [senha, setSenha] = useState(''), [erro, setErro] = useState('')
  async function entrar() {
    if (senha === SENHA_PANELA) {
      try { await entrarAnonimo(); sessionStorage.setItem('panela_ok', '1'); onOk() }
      catch { setErro('Falha ao conectar. Tente de novo.') }
    } else setErro('Senha errada.')
  }
  return (
    <div className="gate"><div className="box">
      <img src={logo} alt="Panella FC" />
      <p>Digite a senha do grupo pra confirmar presença.</p>
      <input className="input" type="password" value={senha} placeholder="Senha da panela"
        onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && entrar()} />
      <div className="err">{erro}</div>
      <button className="btn primary" onClick={entrar}>Entrar</button>
    </div></div>
  )
}

function CardJogador({ j, travado, uid, onToggle, onRemover, onEditar, onVote }) {
  return (
    <div className={`player ${j.confirmado ? 'on' : ''}`}>
      {j.fotoURL ? <img className="avatar" src={j.fotoURL} alt={j.nome} /> : <div className="avatar" style={{ background: CORES[j.posicao] }}>{iniciais(j.nome)}</div>}
      <div className="info">
        <div className="nome">{j.nome}</div>
        <div className="meta">
          <span className={`pos-tag pos-${j.posicao}`}>{j.posicao}</span>
          {j.posicaoSecundaria && <span className="pos-tag2">{j.posicaoSecundaria}</span>}
          {j.avulso && <span className="avulso-tag">avulso</span>}
        </div>
        <Estrelas j={j} uid={uid} onVote={onVote} />
      </div>
      {!travado && <button className="toggle mini" onClick={() => onEditar(j)} title="Editar">✎</button>}
      {!travado && <button className="toggle mini" onClick={() => onRemover(j)} title="Excluir">🗑</button>}
      <button className={`toggle ${j.confirmado ? 'on' : ''}`} disabled={travado} onClick={() => onToggle(j)}>{j.confirmado ? 'Confirmado' : 'Confirmar'}</button>
    </div>
  )
}

export default function App() {
  const [logado, setLogado] = useState(() => sessionStorage.getItem('panela_ok') === '1')
  const [uid, setUid] = useState(null)
  const [jogadores, setJogadores] = useState([])
  const [sorteio, setSorteio] = useState(null)
  const [votacao, setVotacao] = useState(null)
  const [historico, setHistorico] = useState([])
  const [aba, setAba] = useState('presenca')
  const [abaCadastro, setAbaCadastro] = useState(null)
  const [editando, setEditando] = useState(null)
  const [encerrando, setEncerrando] = useState(false)
  const [coroacao, setCoroacao] = useState(null) // premiados da última coroação (tela de cards)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || null)
      // se não houver sessão (login pulado pelo "já entrei"), entra anônimo
      if (!u && !faltaConfig) entrarAnonimo().catch((e) => console.error('login anônimo falhou', e?.code))
    })
    return unsub
  }, [])
  useEffect(() => {
    if (!logado) return
    const uns = [
      onSnapshot(query(collection(db, 'jogadores'), orderBy('criadoEm', 'asc')), (s) => setJogadores(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(SORTEIO_REF, (d) => setSorteio(d.exists() ? d.data() : null)),
      onSnapshot(VOTACAO_REF, (d) => setVotacao(d.exists() ? d.data() : null)),
      onSnapshot(query(collection(db, 'historico'), orderBy('rodadaEm', 'desc'), limit(20)), (s) => setHistorico(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ]
    return () => uns.forEach((u) => u())
  }, [logado])

  const confirmados = useMemo(() => jogadores.filter((j) => j.confirmado), [jogadores])
  const nTimes = maxTimes(confirmados)
  const travado = !!sorteio?.gerado
  const emVotacao = !!votacao?.aberta
  const participantes = useMemo(() => {
    const ids = new Set(votacao?.participantes || [])
    return jogadores.filter((j) => ids.has(j.id))
  }, [jogadores, votacao])

  async function toggle(j) {
    try { await updateDoc(doc(db, 'jogadores', j.id), { confirmado: !j.confirmado }) }
    catch (e) { alert('Não deu pra confirmar.\nCódigo: ' + (e?.code || '?')) }
  }
  async function remover(j) {
    if (!confirm(`Excluir ${j.nome}? Apaga o jogador de vez (nome, vitórias e presenças).`)) return
    try { await deleteDoc(doc(db, 'jogadores', j.id)) }
    catch (e) { alert('Não deu pra excluir.\nCódigo: ' + (e?.code || '?')) }
  }
  async function avaliarHab(j, n) {
    try { await garantirLogin() } catch { return }
    const id = auth.currentUser?.uid
    if (!id) return
    try { await updateDoc(doc(db, 'jogadores', j.id), { [`habVotos.${id}`]: n }) }
    catch (e) { alert('Não deu pra avaliar.\nCódigo: ' + (e?.code || '?')) }
  }

  async function sortear() {
    if (nTimes < 1 || travado) return
    // usa a média das avaliações da galera como habilidade
    const confs = confirmados.map((p) => ({ ...p, habilidade: mediaHab(p) }))
    const { times, banco } = sortearTimes(confs)
    const trim = (arr) => (arr || []).map((p) => ({ id: p.id, nome: p.nome, posicao: p.posicao, fotoURL: p.fotoURL || '' }))
    const timesLimpos = times.map((t) => ({ id: t.id, forca: t.forca, jogadores: trim(t.jogadores), banco: trim(t.banco) }))
    try {
      await setDoc(SORTEIO_REF, { gerado: true, times: timesLimpos, banco: trim(banco), nTimes: times.length })
      setAba('times')
    } catch (e) {
      console.error(e)
      const perm = String(e?.code || '').includes('permission')
      alert('Não consegui salvar o sorteio pra todos.\nCódigo: ' + (e?.code || '?') + (perm ? '\n\nPublique as regras do Firestore liberando a coleção "estado".' : ''))
    }
  }

  async function encerrarPartida(dados) {
    await setDoc(VOTACAO_REF, { aberta: true, votos: {}, ...dados })
    setEncerrando(false); setAba('rato')
  }
  async function votar(alvoId) {
    try { await garantirLogin() } catch { return }
    const id = auth.currentUser?.uid
    if (id) await updateDoc(VOTACAO_REF, { [`votos.${id}`]: alvoId })
  }
  async function votarCraque(alvoId) {
    try { await garantirLogin() } catch { return }
    const id = auth.currentUser?.uid
    if (id) await updateDoc(VOTACAO_REF, { [`votosCraque.${id}`]: alvoId })
  }

  async function recomecar() {
    if (!confirm('Recomeçar? Cancela o sorteio/partida atual e libera um novo jogo. As presenças e o histórico continuam.')) return
    const batch = writeBatch(db)
    batch.set(SORTEIO_REF, { gerado: false, times: [], banco: [], nTimes: 0 })
    batch.set(VOTACAO_REF, { aberta: false, votos: {}, votosCraque: {} })
    try { await batch.commit(); setEncerrando(false); setAba('presenca') }
    catch (e) { alert('Não deu pra recomeçar.\nCódigo: ' + (e?.code || '?')) }
  }

  async function coroar() {
    function apurar(mapa) {
      const lista = Object.values(mapa || {})
      if (!lista.length) return { nome: '', foto: '', max: 0, id: null }
      const cont = {}; lista.forEach((id) => { cont[id] = (cont[id] || 0) + 1 })
      let vid = null, max = 0
      for (const [id, n] of Object.entries(cont)) if (n > max) { max = n; vid = id }
      const v = jogadores.find((j) => j.id === vid)
      return { nome: v?.nome || '?', foto: v?.fotoURL || '', max, id: vid }
    }
    const rato = apurar(votacao?.votos)
    const craque = apurar(votacao?.votosCraque)
    const resumo = [
      craque.id ? `⭐ Craque: ${craque.nome} (${craque.max})` : '⭐ Craque: sem votos',
      rato.id ? `🐀 Rato: ${rato.nome} (${rato.max})` : '🐀 Rato: sem votos',
    ].join('\n')
    if (!confirm(`Coroar e encerrar a noite?\n\n${resumo}`)) return

    const batch = writeBatch(db)
    batch.set(doc(collection(db, 'historico')), {
      rodadaEm: Date.now(),
      placar: votacao?.placar || null,
      vencedor: votacao?.vencedor || 'empate',
      fotoTimeURL: votacao?.fotoTimeURL || '',
      ratoNome: rato.nome && rato.id ? rato.nome : '', ratoFotoURL: rato.foto, votos: rato.max,
      craqueNome: craque.nome && craque.id ? craque.nome : '', craqueFotoURL: craque.foto, craqueVotos: craque.max,
    })
    const venc = votacao?.vencedor
    const idxVenc = venc === 'time1' ? 0 : venc === 'time2' ? 1 : -1
    const vencedores = idxVenc >= 0 ? new Set((sorteio?.times?.[idxVenc]?.jogadores || []).map((p) => p.id)) : new Set()
    const avaliacoes = votacao?.avaliacoes || {}
    const idsPart = new Set(votacao?.participantes || [])
    jogadores.forEach((j) => {
      if (!idsPart.has(j.id)) return
      const upd = { jogos: (j.jogos || 0) + 1 }
      if (vencedores.has(j.id)) upd.vitorias = (j.vitorias || 0) + 1
      if (avaliacoes[j.id]) { upd.notaSoma = (j.notaSoma || 0) + avaliacoes[j.id]; upd.notaQtd = (j.notaQtd || 0) + 1 }
      if (j.id === rato.id) upd.ratos = (j.ratos || 0) + 1
      if (j.id === craque.id) upd.craques = (j.craques || 0) + 1
      batch.update(doc(db, 'jogadores', j.id), upd)
    })
    jogadores.filter((j) => j.avulso).forEach((j) => batch.delete(doc(db, 'jogadores', j.id)))
    jogadores.filter((j) => !j.avulso && j.confirmado).forEach((j) => batch.update(doc(db, 'jogadores', j.id), { confirmado: false }))
    batch.set(SORTEIO_REF, { gerado: false, times: [], banco: [], nTimes: 0 })
    batch.set(VOTACAO_REF, { aberta: false, votos: {}, votosCraque: {} })
    try {
      await batch.commit()
      setCoroacao({ rato, craque })
      setAba('coroacao')
    }
    catch (e) { console.error(e); alert('Não consegui encerrar a noite.\nCódigo: ' + (e?.code || '?')) }
  }

  if (faltaConfig) {
    return (
      <div className="gate"><div className="box" style={{ textAlign: 'left' }}>
        <img src={logo} alt="Panella FC" style={{ margin: '0 auto 12px', display: 'block' }} />
        <h3 style={{ fontFamily: 'Anton, sans-serif', textAlign: 'center' }}>Falta configurar o Firebase</h3>
        <p style={{ color: 'var(--muted)' }}>Crie o arquivo <b>.env</b> (copie o <b>.env.example</b>), preencha as chaves e <b>rode de novo</b> o <code>npm run dev</code>.</p>
      </div></div>
    )
  }
  if (!logado) return <Gate onOk={() => setLogado(true)} />

  const falta = faltando(confirmados)

  return (
    <div className="app">
      <div className="top">
        <img src={logo} alt="Panella FC" />
        <p className="slogan">Aqui o futebol é de segunda… <b>mas a resenha é de primeira!</b></p>
      </div>

      {aba === 'presenca' && (
        <>
          <div className="status">
            <div className="stat"><div className="num">{confirmados.length}</div><div className="lbl">confirmados</div></div>
            <div className="stat"><div className="num">{nTimes}</div><div className="lbl">{nTimes === 1 ? 'time possível' : 'times possíveis'}</div></div>
          </div>

          {editando && (<><div className="section-title">Editar jogador</div><Cadastro jogador={editando} onPronto={() => setEditando(null)} /></>)}

          {!editando && (
            <>
              <div className="section-title">Confirme sua presença</div>
              {jogadores.length === 0 && <p className="hint">Ninguém cadastrado ainda. Bora começar? 👇</p>}
              {jogadores.map((j) => <CardJogador key={j.id} j={j} travado={travado} uid={uid} onToggle={toggle} onRemover={remover} onEditar={setEditando} onVote={avaliarHab} />)}

              {!travado && (
                <>
                  <div className="section-title">Adicionar</div>
                  <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                    <button className="btn ghost" onClick={() => setAbaCadastro(abaCadastro === 'fixo' ? null : 'fixo')}>+ Jogador fixo</button>
                    <button className="btn ghost" onClick={() => setAbaCadastro(abaCadastro === 'avulso' ? null : 'avulso')}>+ Avulso do dia</button>
                  </div>
                  <button className="btn ghost" style={{ marginBottom: 8 }} onClick={() => setAbaCadastro(abaCadastro === 'importar' ? null : 'importar')}>➕ Adicionar os 25 jogadores do Panella</button>
                  {abaCadastro === 'fixo' && <Cadastro onPronto={() => setAbaCadastro(null)} />}
                  {abaCadastro === 'avulso' && <Cadastro avulso onPronto={() => setAbaCadastro(null)} />}
                  {abaCadastro === 'importar' && <Importar existentes={jogadores} onPronto={() => setAbaCadastro(null)} />}

                  <button className="btn primary" disabled={nTimes < 1} onClick={sortear}>
                    {nTimes < 1 ? 'Ainda não dá pra sortear' : `Sortear ${nTimes} ${nTimes === 1 ? 'time' : 'times'}`}
                  </button>
                  {nTimes < 1 && falta.length > 0 && <p className="hint">Falta: {falta.map((f) => `${f.falta} ${ROTULO_POSICAO[f.pos].toLowerCase()}${f.falta > 1 ? 's' : ''}`).join(', ')}</p>}
                  {nTimes >= 1 && <p className="hint">Máximo de 2 times; o resto fica no banco. Combine de sortear só às 18h.</p>}
                </>
              )}

              {travado && !emVotacao && !encerrando && (
                <>
                  <p className="hint">Times sorteados — veja na aba <b>Times</b>. Acabou o jogo?</p>
                  <button className="btn danger" onClick={() => setEncerrando(true)}>Encerrar partida</button>
                  <button className="btn ghost" style={{ marginTop: 8 }} onClick={recomecar}>Cancelar e sortear de novo</button>
                </>
              )}
              {travado && encerrando && <EncerrarPartida times={sorteio.times} onEncerrar={encerrarPartida} onCancelar={() => setEncerrando(false)} />}
              {emVotacao && (
                <>
                  <p className="hint">Partida encerrada. Vá na aba <b>Pé de rato</b> pra votar e coroar. 🐀</p>
                  <button className="btn ghost" style={{ marginTop: 8 }} onClick={recomecar}>Recomeçar (novo jogo, sem coroar)</button>
                </>
              )}
            </>
          )}
        </>
      )}

      {aba === 'times' && (
        travado && sorteio?.times?.length > 0
          ? (<><div className="section-title">Times sorteados · escalação</div><Escalacao times={sorteio.times} banco={sorteio.banco || []} /></>)
          : <p className="hint">Nenhum time sorteado. Confirme a galera e sorteie na aba <b>Presença</b>.</p>
      )}

      {aba === 'ranking' && <Ranking jogadores={jogadores} />}
      {aba === 'rato' && <PeDeRato participantes={participantes} votacao={votacao} historico={historico} uid={uid} onVotarRato={votar} onVotarCraque={votarCraque} onCoroar={coroar} />}
      {aba === 'coroacao' && coroacao && (
        <>
          <div className="section-title">Premiados da rodada · baixe e manda no grupo</div>
          {coroacao.craque?.id && (
            <>
              <div className="section-title">⭐ Craque: {coroacao.craque.nome}</div>
              <CardPremio tema="craque" nomeInicial={coroacao.craque.nome} votosInicial={`${coroacao.craque.max} ${coroacao.craque.max === 1 ? 'voto' : 'votos'} da resenha`} fotoInicial={coroacao.craque.foto} />
            </>
          )}
          {coroacao.rato?.id && (
            <>
              <div className="section-title">🐀 Pé de rato: {coroacao.rato.nome}</div>
              <CardPremio tema="rato" nomeInicial={coroacao.rato.nome} votosInicial={`${coroacao.rato.max} ${coroacao.rato.max === 1 ? 'voto' : 'votos'} da resenha`} fotoInicial={coroacao.rato.foto} />
            </>
          )}
          {!coroacao.craque?.id && !coroacao.rato?.id && <p className="hint">Ninguém foi votado nessa rodada.</p>}
          <button className="btn primary" onClick={() => { setCoroacao(null); setAba('historico') }}>Concluir</button>
        </>
      )}
      {aba === 'historico' && (<><div className="section-title">Histórico de jogos</div><Historico historico={historico} /></>)}

      <nav className="nav"><div className="nav-inner">
        {[
          ['presenca', IconPresenca, 'Presença'],
          ['times', IconTimes, 'Times'],
          ['ranking', IconRanking, 'Ranking'],
          ['rato', IconPremio, 'Prêmios'],
          ['historico', IconHistorico, 'Histórico'],
        ].map(([k, Icon, lbl]) => (
          <button key={k} className={aba === k ? 'active' : ''} onClick={() => { setAba(k); setEditando(null); window.scrollTo({ top: 0 }) }}>
            <span className="ic"><Icon /></span>{lbl}
          </button>
        ))}
      </div></nav>
    </div>
  )
}
