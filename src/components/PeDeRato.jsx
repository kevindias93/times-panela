import CardPremio from './CardPremio'

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

function CampeaoCard({ tema, ultimo, campo, fotoCampo, votosCampo }) {
  const nome = ultimo?.[campo]
  return (
    <div className={`rato-card ${tema === 'craque' ? 'ouro' : ''}`}>
      <h2 className="rato-title">{tema === 'craque' ? <>Craque<br />da Rodada!</> : <>Pé de Rato<br />da Rodada!</>}</h2>
      <div className="rato-sub">{tema === 'craque' ? '⭐' : '🐀'} 🏆 {nome ? 'último vencedor' : 'sem coroado ainda'} 🏆 {tema === 'craque' ? '⭐' : '🐀'}</div>
      {nome ? (
        <div className="rato-win">
          {ultimo[fotoCampo] ? <img className="face" src={ultimo[fotoCampo]} alt={nome} /> : <div className="face">{ini(nome)}</div>}
          <div className="who"><div className="n">{nome}</div><div className="v">{ultimo[votosCampo]} {ultimo[votosCampo] === 1 ? 'voto' : 'votos'}</div></div>
        </div>
      ) : <p className="rato-quote">Ninguém coroado ainda. Encerre uma partida pra abrir a votação.</p>}
    </div>
  )
}

export default function PeDeRato({ participantes, votacao, historico, uid, onVotarRato, onVotarCraque, onCoroar }) {
  const aberta = !!votacao?.aberta
  const votosR = votacao?.votos || {}
  const votosC = votacao?.votosCraque || {}
  const ultimo = historico?.[0]

  return (
    <>
      {/* CRAQUE */}
      <div className="section-title">Craque da rodada</div>
      <CampeaoCard tema="craque" ultimo={ultimo} campo="craqueNome" fotoCampo="craqueFotoURL" votosCampo="craqueVotos" />
      <div className="section-title">Gerar o card do craque</div>
      <CardPremio tema="craque" nomeInicial={ultimo?.craqueNome || 'Craque'} votosInicial={ultimo?.craqueNome ? `${ultimo.craqueVotos} votos da resenha` : ''} />

      {/* PÉ DE RATO */}
      <div className="section-title">Pé de rato da rodada</div>
      <CampeaoCard tema="rato" ultimo={ultimo} campo="ratoNome" fotoCampo="ratoFotoURL" votosCampo="votos" />
      <div className="section-title">Gerar o card do pé de rato</div>
      <CardPremio tema="rato" nomeInicial={ultimo?.ratoNome || 'Pé de Rato'} votosInicial={ultimo?.ratoNome ? `${ultimo.votos} votos da resenha` : ''} />

      {/* VOTAÇÃO */}
      {aberta ? (
        <>
          <Votacao titulo="🏆 Vote no CRAQUE · só quem jogou" participantes={participantes} votos={votosC} uid={uid} onVotar={onVotarCraque} cor="#F5B841" />
          <Votacao titulo="🐀 Vote no PÉ DE RATO · só quem jogou" participantes={participantes} votos={votosR} uid={uid} onVotar={onVotarRato} cor="#C22030" />
          <button className="btn danger" style={{ marginTop: 12 }} onClick={onCoroar}>Fechar votação e coroar</button>
          <p className="hint">Isso encerra a noite: coroa o craque e o pé de rato, salva no histórico e soma tudo.</p>
        </>
      ) : (
        <p className="hint">A votação abre quando você <b>encerrar a partida</b> (aba Presença → Encerrar partida). Só quem jogou entra na votação.</p>
      )}

      {/* GALERIA DA VERGONHA */}
      {historico?.length > 0 && (
        <>
          <div className="section-title">Galeria da vergonha</div>
          {historico.filter((h) => h.ratoNome).map((h) => (
            <div className="gal-row" key={h.id}>
              {h.ratoFotoURL ? <img src={h.ratoFotoURL} alt={h.ratoNome} /> : <span className="gal-av">{ini(h.ratoNome)}</span>}
              <div className="gal-info">
                <div className="gal-nome">🐀 {h.ratoNome}</div>
                <div className="gal-meta">{dataBR(h.rodadaEm)} · {h.votos} {h.votos === 1 ? 'voto' : 'votos'}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}
