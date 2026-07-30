// Escalação estilo video game (Bomba Patch / PES): mini-campo com formação + lista numerada.
const CORES_POS = { GOL: '#E0A64B', ZAG: '#3C74C9', MEI: '#35A85B', ATA: '#D2352E' }
const CORES_TIME = ['#C22030', '#17356A', '#6A2AB0', '#1E7A46']
const SLOTS = { GOL: [[7, 50]], ZAG: [[28, 32], [28, 68]], MEI: [[52, 20], [52, 50], [52, 80]], ATA: [[78, 50]] }

function ini(n) { return n.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') }

// número de camisa estável por posição (GOL=1, resto 2..)
function comNumeros(jogadores) {
  let n = 2
  return jogadores.map((j) => ({ ...j, num: j.posicao === 'GOL' ? 1 : n++ }))
}

function MiniCampo({ jogadores, cor }) {
  const porPos = { GOL: [], ZAG: [], MEI: [], ATA: [] }
  jogadores.forEach((p) => porPos[p.posicao]?.push(p))
  return (
    <div className="gp-pitch">
      <div className="cline" /><div className="ccircle" />
      <div className="pbox l" /><div className="pbox r" />
      {Object.keys(SLOTS).map((pos) =>
        porPos[pos].map((p, i) => {
          const s = SLOTS[pos][i]; if (!s) return null
          return (
            <div className="chip" style={{ left: `${s[0]}%`, top: `${s[1]}%` }} key={p.id}>
              <div className="bk" style={{ background: cor }}>
                {p.fotoURL ? <img src={p.fotoURL} alt={p.nome} /> : p.num}
              </div>
              <div className="cnm">{p.nome.split(' ')[0]}</div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function Escalacao({ times, banco }) {
  return (
    <div>
      {times.map((time, i) => {
        const cor = CORES_TIME[i % CORES_TIME.length]
        const js = comNumeros(time.jogadores)
        return (
          <div className="gp" key={time.id}>
            <div className="gp-top" style={{ background: cor }}>
              <span className="dot" style={{ background: cor, filter: 'brightness(1.6)' }} />
              <span className="gp-name">Time {time.id}</span>
              <span className="gp-form">1-2-3-1</span>
            </div>
            <MiniCampo jogadores={js} cor={cor} />
            <div className="gp-roster">
              {js.map((p, idx) => (
                <div className="gp-row" key={p.id}>
                  <span className="rn">{p.num}</span>
                  <span className="rname">{p.nome}{idx === 0 && <span className="cap">C</span>}</span>
                  <span className="rp" style={{ background: CORES_POS[p.posicao], color: p.posicao === 'GOL' ? '#241500' : '#fff' }}>{p.posicao}</span>
                </div>
              ))}
            </div>
            <div className="gp-foot">
              <span className="gp-banco">{time.banco?.length ? <><b>Banco:</b> {time.banco.map((b) => b.nome.split(' ')[0]).join(', ')}</> : ''}</span>
              <span>Força {time.forca} · {time.jogadores.length} jogadores</span>
            </div>
          </div>
        )
      })}

      {banco?.length > 0 && !times.some((t) => t.banco?.length) && (
        <>
          <div className="section-title">No banco</div>
          <div className="chips">
            {banco.map((j) => <span className="chip" style={{ position: 'static', width: 'auto' }} key={j.id}>{j.nome} · {j.posicao}</span>)}
          </div>
        </>
      )}
    </div>
  )
}
