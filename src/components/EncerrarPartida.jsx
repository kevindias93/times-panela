import { useEffect, useRef, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import logo from '../assets/logo.png'

// Encerra a partida: placar, foto do time (com resultado) e avaliação dos jogadores.
export default function EncerrarPartida({ times, onEncerrar, onCancelar }) {
  const participantes = times.flatMap((t) => [...t.jogadores, ...(t.banco || [])])
  const [g1, setG1] = useState(0)
  const [g2, setG2] = useState(0)
  const [arq, setArq] = useState(null)
  const fotoRef = useRef(null)
  const logoRef = useRef(null)
  const canvasRef = useRef(null)
  const [notas, setNotas] = useState(() => Object.fromEntries(participantes.map((p) => [p.id, 3])))
  const [verNotas, setVerNotas] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const vencedor = g1 > g2 ? 'time1' : g2 > g1 ? 'time2' : 'empate'

  useEffect(() => {
    const img = new Image(); img.onload = () => { logoRef.current = img; desenhar() }; img.src = logo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { desenhar() })

  function cover(ctx, img, x, y, w, h) {
    const ir = img.width / img.height, r = w / h; let sw, sh, sx, sy
    if (ir > r) { sh = img.height; sw = sh * r; sx = (img.width - sw) / 2; sy = 0 }
    else { sw = img.width; sh = sw / r; sx = 0; sy = (img.height - sh) / 2 }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  }
  async function desenhar() {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    if (document.fonts?.ready) await document.fonts.ready
    const W = 1080, FAIXA = 300
    const img = fotoRef.current
    // a foto entra INTEIRA (altura acompanha a proporção); nada de corte nas pontas
    const fh = img ? Math.max(400, Math.round(W * (img.height / img.width))) : 700
    const H = fh + FAIXA
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H }
    ctx.fillStyle = '#0A1A30'; ctx.fillRect(0, 0, W, H)
    if (img) ctx.drawImage(img, 0, 0, W, fh)
    else { ctx.fillStyle = '#10233F'; ctx.fillRect(0, 0, W, fh); ctx.fillStyle = '#8FA6C8'; ctx.font = '40px Inter'; ctx.textAlign = 'center'; ctx.fillText('Escolha a foto do time', W / 2, fh / 2) }
    // faixa do resultado (abaixo da foto, sem cobrir ninguém)
    ctx.fillStyle = '#0A1A30'; ctx.fillRect(0, fh, W, FAIXA)
    ctx.fillStyle = '#F5B841'; ctx.fillRect(0, fh, W, 6)
    ctx.textAlign = 'center'
    ctx.font = '44px Anton'; ctx.fillStyle = '#F5B841'
    ctx.fillText('PANELLA FC', W / 2, fh + 70)
    ctx.font = '120px Anton'; ctx.fillStyle = '#fff'
    ctx.fillText(`${g1}  X  ${g2}`, W / 2, fh + 190)
    ctx.font = '36px Inter'; ctx.fillStyle = '#F3E9CC'
    const txt = vencedor === 'empate' ? 'Empate na resenha' : `Vitória do Time ${vencedor === 'time1' ? '1' : '2'}`
    ctx.fillText(txt, W / 2, fh + 250)
    if (logoRef.current) { const lw = 110, lh = lw * logoRef.current.naturalHeight / logoRef.current.naturalWidth; ctx.drawImage(logoRef.current, W - lw - 30, fh + (FAIXA - lh) / 2, lw, lh) }
  }
  function escolherFoto(e) {
    const f = e.target.files?.[0]; if (!f) return
    setArq(f); const img = new Image(); img.onload = () => { fotoRef.current = img; desenhar() }; img.src = URL.createObjectURL(f)
  }
  function baixarCard() {
    try { const a = document.createElement('a'); a.download = 'resultado-panella.png'; a.href = canvasRef.current.toDataURL('image/png'); a.click() }
    catch { alert('Não consegui exportar essa foto (restrição do navegador).') }
  }

  async function confirmar() {
    if (salvando) return
    setSalvando(true)
    try {
      let fotoTimeURL = ''
      if (arq) { const r = ref(storage, `times/${Date.now()}-${arq.name}`); await uploadBytes(r, arq); fotoTimeURL = await getDownloadURL(r) }
      onEncerrar({
        placar: { t1: g1, t2: g2 },
        vencedor,
        fotoTimeURL,
        participantes: participantes.map((p) => p.id),
        avaliacoes: notas,
      })
    } catch (e) { console.error(e); alert('Não consegui salvar a foto do time. Código: ' + (e?.code || '?')) }
    finally { setSalvando(false) }
  }

  return (
    <div className="form">
      <div className="section-title" style={{ margin: '0 0 12px' }}>Encerrar partida</div>
      <div className="placar">
        <div className="pl"><span>Time 1</span><input type="number" min="0" value={g1} onChange={(e) => setG1(Math.max(0, +e.target.value || 0))} /></div>
        <span className="x">X</span>
        <div className="pl"><span>Time 2</span><input type="number" min="0" value={g2} onChange={(e) => setG2(Math.max(0, +e.target.value || 0))} /></div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Foto do time (com o resultado)</label>
        <label className="file" style={{ display: 'block', textAlign: 'center' }}>📸 Escolher foto do time
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={escolherFoto} />
        </label>
        <canvas ref={canvasRef} width="1080" height="1080" className="card-canvas" />
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={baixarCard}>Baixar card do resultado</button>
      </div>

      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setVerNotas((v) => !v)}>
        {verNotas ? 'Esconder avaliações' : 'Avaliar jogadores (opcional)'}
      </button>
      {verNotas && (
        <div style={{ marginTop: 8 }}>
          {participantes.map((p) => (
            <div className="aval-row" key={p.id}>
              <span className="nome" style={{ flex: 1 }}>{p.nome}</span>
              <div className="skill-pick" style={{ width: 170 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={notas[p.id] === n ? 'sel' : ''} onClick={() => setNotas((o) => ({ ...o, [p.id]: n }))}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn primary" style={{ marginTop: 14 }} onClick={confirmar} disabled={salvando}>
        {salvando ? 'Salvando…' : 'Encerrar e abrir votação'}
      </button>
      <button className="btn ghost" style={{ marginTop: 8 }} onClick={onCancelar}>Voltar</button>
      <p className="hint">Ao encerrar, abre a votação do pé de rato só com quem participou.</p>
    </div>
  )
}
