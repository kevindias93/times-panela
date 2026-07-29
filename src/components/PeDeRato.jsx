import CardRato from './CardRato'

function iniciais(nome) { return nome.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('') }

export default function PeDeRato({ participantes, votacao, historico, uid, onVotar, onCoroar }) {
  const aberta = !!votacao?.aberta
  const votos = votacao?.votos || {}
  const meuVoto = votos[uid]
  const contagem = (participantes || [])
    .map((j) => ({ ...j, votos: Object.values(votos).filter((v) => v === j.id).length }))
    .sort((a, b) => b.votos - a.votos)
  const ultimo = historico?.[0]

  return (
    <>
      <div className="section-title">Pé de rato da rodada</div>
      <div className="rato-card">
        <h2 className="rato-title">Pé de Rato<br />da Rodada!</h2>
        <div className="rato-sub">🐀 🏆 {ultimo ? 'último vencedor' : 'sem coroado ainda'} 🏆 🐀</div>
        {ultimo ? (
          <>
            <div className="rato-win">
              {ultimo.ratoFotoURL ? <img className="face" src={ultimo.ratoFotoURL} alt={ultimo.ratoNome} /> : <div className="face">{iniciais(ultimo.ratoNome || '?')}</div>}
              <div className="who"><div className="n">{ultimo.ratoNome}</div><div className="v">{ultimo.votos} {ultimo.votos === 1 ? 'voto' : 'votos'}</div></div>
            </div>
            <p className="rato-quote">Faz parte da resenha! Semana que vem tem chance de devolver… ou piorar 👀</p>
          </>
        ) : <p className="rato-quote">Ninguém coroado ainda. Encerre uma partida pra abrir a votação.</p>}
      </div>

      <div className="section-title">Gerar o card pro zap</div>
      <CardRato nomeInicial={ultimo?.ratoNome || 'Pé de Rato'} votosInicial={ultimo ? `${ultimo.votos} ${ultimo.votos === 1 ? 'voto' : 'votos'} da resenha` : ''} />

      {aberta ? (
        <>
          <div className="section-title">Votação · só quem jogou · toque num nome</div>
          {contagem.map((j) => (
            <div className={`vote-opt ${meuVoto === j.id ? 'sel' : ''}`} key={j.id} onClick={() => onVotar(j.id)}>
              <div className="radio" />
              {j.fotoURL ? <img className="avatar" style={{ width: 38, height: 38 }} src={j.fotoURL} alt={j.nome} />
                : <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: '#e5484d', color: '#fff' }}>{iniciais(j.nome)}</div>}
              <div className="nome" style={{ flex: 1 }}>{j.nome}</div>
              {j.votos > 0 && <span className="vote-count">{j.votos}</span>}
            </div>
          ))}
          <button className="btn danger" style={{ marginTop: 12 }} onClick={onCoroar}>Fechar votação e coroar o rato</button>
          <p className="hint">Isso encerra a noite: coroa o mais votado, salva o jogo no histórico, soma presenças e vitórias.</p>
        </>
      ) : (
        <p className="hint">A votação abre quando você <b>encerrar a partida</b> (aba Presença → Encerrar partida). Só quem jogou pode receber voto.</p>
      )}

      {historico?.length > 0 && (
        <>
          <div className="section-title">Galeria da vergonha</div>
          {historico.map((h, i) => <div className="past" key={h.id || i}>🐀 <b>{h.ratoNome}</b> · {h.votos} {h.votos === 1 ? 'voto' : 'votos'}</div>)}
        </>
      )}
    </>
  )
}
