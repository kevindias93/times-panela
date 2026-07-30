import { useState } from 'react'

const ini = (n) => (n || '?').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('')
const dataBR = (ts) => { try { return new Date(ts).toLocaleDateString('pt-BR') } catch { return '' } }

function Votacao({ titulo, participantes, votos, uid, onVotar, cor }) {
  const meu = votos[uid]
  const contagem = participantes
    .map((j) => ({ ...j, n: Object.values(votos).filter((v) => v === j.id).length }))
    .sort((a, b) => b.n - a.n)
  return (
    <>
      <div className="section-title">{titulo}</div>
      {contagem.map((j) => (
        <div className={`vote-opt ${meu === j.id ? 'sel' : ''}`} key={j.id} onClick={() => onVotar(j.id)} style={meu === j.id ? { borderColor: cor } : null}>
          <div className="radio" style={meu === j.id ? { borderColor: cor, background: cor } : null} />
          {j.fotoURL ? <img className="avatar" style={{ width: 38, height: 38 }} src={j.fotoURL} alt={j.nome} />
            : <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: cor, color: '#fff' }}>{ini(j.nome)}</div>}
          <div className="nome" style={{ flex: 1 }}>{j.nome}</div>
          {j.n > 0 && <span className="vote-count">{j.n}</span>}
        </div>
      ))}
    </>
  )
}

// Mural clicável: toca no premiado e abre a foto grande com data e votos.
function Mural({ titulo, itens, emoji, corAv }) {
  const [aberto, setAberto] = useState(null)
  if (!itens.length) return null
  return (
    <>
      <div className="section-title">{titulo}</div>
      {itens.map((it) => (
        <div key={it.id}>
          <div className="gal-row mural-item" onClick={() => setAberto(aberto === it.id ? null : it.id)}>
            {it.foto ? <img src={it.foto} alt={it.nome} /> : <span className="gal-av" style={{ background: corAv }}>{ini(it.nome)}</span>}
            <div className="gal-info">
              <div className="gal-nome">{emoji} {it.nome}</div>
              <div className="gal-meta">{dataBR(it.quando)} · {it.votos} {it.votos === 1 ? 'voto' : 'votos'}{it.placar ? ` · jogo ${it.placar}` : ''}</div>
            </div>
            <span style={{ color: 'var(--muted)' }}>{aberto === it.id ? '▲' : '▼'}</span>
          </div>
          {aberto === it.id && (
            <div className="mural-big">
              {it.foto ? <img src={it.foto} alt={it.nome} /> : <div className="gal-av" style={{ width: 120, height: 120, fontSize: 40, margin: '0 auto 8px', background: corAv }}>{ini(it.nome)}</div>}
              <div className="gal-nome" style={{ fontSize: 18 }}>{emoji} {it.nome}</div>
              <div className="m-meta">{dataBR(it.quando)} · {it.votos} {it.votos === 1 ? 'voto' : 'votos'}</div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default function PeDeRato({ participantes, votacao, historico, uid, onVotarRato, onVotarCraque, onCoroar }) {
  const aberta = !!votacao?.aberta
  const votosR = votacao?.votos || {}
  const votosC = votacao?.votosCraque || {}

  const fmtPlacar = (h) => (h.placar ? `${h.placar.t1}x${h.placar.t2}` : '')
  const orgulho = (historico || []).filter((h) => h.craqueNome).map((h) => ({
    id: 'c' + h.id, nome: h.craqueNome, foto: h.craqueFotoURL, votos: h.craqueVotos, quando: h.rodadaEm, placar: fmtPlacar(h),
  }))
  const vergonha = (historico || []).filter((h) => h.ratoNome).map((h) => ({
    id: 'r' + h.id, nome: h.ratoNome, foto: h.ratoFotoURL, votos: h.votos, quando: h.rodadaEm, placar: fmtPlacar(h),
  }))

  return (
    <>
      {aberta ? (
        <>
          <Votacao titulo="🏆 Vote no CRAQUE · só quem jogou" participantes={participantes} votos={votosC} uid={uid} onVotar={onVotarCraque} cor="#F5B841" />
          <Votacao titulo="🐀 Vote no PÉ DE RATO · só quem jogou" participantes={participantes} votos={votosR} uid={uid} onVotar={onVotarRato} cor="#C22030" />
          <button className="btn danger" style={{ marginTop: 12 }} onClick={onCoroar}>Fechar votação e coroar</button>
          <p className="hint">Ao coroar, os cards do craque e do pé de rato são gerados na hora pra você baixar.</p>
        </>
      ) : (
        <p className="hint">A votação abre quando você <b>encerrar a partida</b>. Aqui ficam os murais — toque num nome pra ver a foto.</p>
      )}

      <Mural titulo="⭐ Mural do orgulho" itens={orgulho} emoji="⭐" corAv="#F5B841" />
      <Mural titulo="🐀 Mural da vergonha" itens={vergonha} emoji="🐀" corAv="#e5484d" />
    </>
  )
}
