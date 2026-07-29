import { useState } from 'react'

const ABAS = [
  { k: 'jogos', lbl: 'Presenças', unidade: 'jogos', get: (j) => j.jogos || 0 },
  { k: 'vitorias', lbl: 'Vitórias', unidade: 'vitórias', get: (j) => j.vitorias || 0 },
  { k: 'nota', lbl: 'Avaliação', unidade: 'nota', get: (j) => (j.notaQtd ? j.notaSoma / j.notaQtd : 0) },
]

export default function Ranking({ jogadores }) {
  const [aba, setAba] = useState('jogos')
  const conf = ABAS.find((a) => a.k === aba)
  const ordenado = [...jogadores].filter((j) => !j.avulso).sort((a, b) => conf.get(b) - conf.get(a))
  const max = Math.max(1, ...ordenado.map(conf.get))

  return (
    <>
      <div className="rank-tabs">
        {ABAS.map((a) => (
          <button key={a.k} className={aba === a.k ? 'on' : ''} onClick={() => setAba(a.k)}>{a.lbl}</button>
        ))}
      </div>
      {ordenado.length === 0 && <p className="hint">Ainda sem dados. Isso começa a contar quando você encerra a primeira partida.</p>}
      {ordenado.map((j, i) => {
        const v = conf.get(j)
        const txt = aba === 'nota' ? (j.notaQtd ? v.toFixed(1) : '–') : v
        return (
          <div className={`rank-row ${i < 3 ? 'p' + (i + 1) : ''}`} key={j.id}>
            <div className="rank-pos">{i + 1}º</div>
            <div className="info">
              <div className="nome">{j.nome}{aba === 'nota' && j.notaQtd ? <span className="stars"> {'★'.repeat(Math.round(v))}</span> : null}</div>
              <div className="rank-bar"><i style={{ width: `${Math.round((v / max) * 100)}%` }} /></div>
            </div>
            <div className="rank-count"><b>{txt}</b><span>{conf.unidade}</span></div>
          </div>
        )
      })}
    </>
  )
}
