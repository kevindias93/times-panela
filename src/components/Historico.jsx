function iniciais(n) { return n.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') }
function dataBR(ts) { try { return new Date(ts).toLocaleDateString('pt-BR') } catch { return '' } }

export default function Historico({ historico }) {
  if (!historico?.length) return <p className="hint">Sem jogos ainda. O histórico aparece quando você encerra a primeira partida.</p>
  return (
    <>
      {historico.map((h) => (
        <div className="hist-card" key={h.id}>
          {h.fotoTimeURL && <img className="hist-foto" src={h.fotoTimeURL} alt="time vencedor" />}
          <div className="hist-body">
            <div className="hist-top">
              <span className="hist-data">{dataBR(h.rodadaEm)}</span>
              <span className="hist-placar">{h.placar ? `${h.placar.t1} x ${h.placar.t2}` : ''}</span>
            </div>
            <div className="hist-venc">🏆 {h.vencedor === 'empate' ? 'Empate' : `Vitória do Time ${h.vencedor === 'time1' ? '1' : '2'}`}</div>
            {h.craqueNome && (
              <div className="hist-rato">
                {h.craqueFotoURL ? <img src={h.craqueFotoURL} alt={h.craqueNome} /> : <span className="mini-av" style={{ background: '#F5B841', color: '#241500' }}>{iniciais(h.craqueNome)}</span>}
                ⭐ Craque: <b>{h.craqueNome}</b> ({h.craqueVotos} {h.craqueVotos === 1 ? 'voto' : 'votos'})
              </div>
            )}
            {h.ratoNome && (
              <div className="hist-rato">
                {h.ratoFotoURL ? <img src={h.ratoFotoURL} alt={h.ratoNome} /> : <span className="mini-av">{iniciais(h.ratoNome)}</span>}
                🐀 Pé de rato: <b>{h.ratoNome}</b> ({h.votos} {h.votos === 1 ? 'voto' : 'votos'})
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
