import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'

const PROMPT_IA = 'graffiti street art brick wall, spray paint splatter, sneaky cartoon rat mascot, golden trophy, purple magenta blue neon palette, urban night, vertical poster background, no text, no words, no letters'
function urlFundoIA(seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(PROMPT_IA)}?width=1080&height=1350&nologo=true&seed=${seed}`
}

export default function CardRato({ nomeInicial = 'Pé de Rato', votosInicial = '' }) {
  const canvasRef = useRef(null), fotoRef = useRef(null), logoRef = useRef(null), fundoRef = useRef(null)
  const [nome, setNome] = useState(nomeInicial)
  const [votos, setVotos] = useState(votosInicial)
  const [gerandoIA, setGerandoIA] = useState(false)

  useEffect(() => { const img = new Image(); img.onload = () => { logoRef.current = img; desenhar() }; img.src = logo }, []) // eslint-disable-line
  useEffect(() => { desenhar() })

  function cover(ctx, img, x, y, w, h) {
    const ir = img.width / img.height, r = w / h; let sw, sh, sx, sy
    if (ir > r) { sh = img.height; sw = sh * r; sx = (img.width - sw) / 2; sy = 0 }
    else { sw = img.width; sh = sw / r; sx = 0; sy = (img.height - sh) / 2 }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
  }
  // ruído determinístico pra splatter/tijolos ficarem estáveis entre redesenhos
  function rnd(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280 }
  function fundoGrafite(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#3a1050'); g.addColorStop(.5, '#7d1e6a'); g.addColorStop(1, '#c21f5b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    // tijolos sutis
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 3
    for (let y = 0; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let y = 0, row = 0; y < H; y += 70, row++) for (let x = (row % 2 ? 0 : 110); x < W; x += 220) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 70); ctx.stroke() }
    // splatter
    const r = rnd(7), cores = ['rgba(255,60,160,.5)', 'rgba(90,220,255,.35)', 'rgba(255,210,74,.4)']
    for (let i = 0; i < 90; i++) { ctx.fillStyle = cores[i % 3]; ctx.beginPath(); ctx.arc(r() * W, r() * H, r() * 10 + 1, 0, 7); ctx.fill() }
  }
  function patas(ctx, x, y, s) { // pegadinha de rato
    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.beginPath(); ctx.ellipse(x, y, s, s * 1.3, 0, 0, 7); ctx.fill()
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x + i * s * 0.9, y - s * 1.5, s * 0.4, s * 0.6, 0, 0, 7); ctx.fill() }
  }
  async function desenhar() {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); const W = 1080, H = 1350
    if (document.fonts?.ready) await document.fonts.ready
    if (fundoRef.current) { cover(ctx, fundoRef.current, 0, 0, W, H); ctx.fillStyle = 'rgba(35,8,55,.45)'; ctx.fillRect(0, 0, W, H) }
    else fundoGrafite(ctx, W, H)
    const rg = ctx.createRadialGradient(W / 2, -40, 60, W / 2, -40, W)
    rg.addColorStop(0, 'rgba(255,255,255,.16)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
    ctx.textAlign = 'center'
    patas(ctx, 150, 150, 26); patas(ctx, W - 150, 190, 22)
    // título spray com contorno
    ctx.save(); ctx.translate(W / 2, 250); ctx.rotate(-0.05)
    ctx.font = '160px Bangers'; ctx.lineJoin = 'round'
    ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(0,0,0,.4)'
    ctx.strokeText('PÉ DE RATO', 0, 0); ctx.strokeText('DA RODADA!', 0, 160)
    ctx.fillStyle = '#fff'; ctx.fillText('PÉ DE RATO', 0, 0); ctx.fillText('DA RODADA!', 0, 160)
    ctx.restore()
    ctx.font = '58px Bangers'; ctx.fillStyle = '#ffd24a'; ctx.fillText('🐀   vencedor de hoje   🏆', W / 2, 560)
    // foto
    const cx = W / 2, cy = 840, r = 240
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.closePath()
    if (fotoRef.current) { ctx.save(); ctx.clip(); cover(ctx, fotoRef.current, cx - r, cy - r, r * 2, r * 2); ctx.restore() }
    else { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '120px Anton'; ctx.fillText('?', cx, cy + 42) }
    ctx.lineWidth = 18; ctx.strokeStyle = '#fff'; ctx.stroke()
    ctx.lineWidth = 6; ctx.strokeStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.stroke(); ctx.restore()
    // nome + votos
    ctx.font = '100px Anton'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10
    ctx.fillText((nome || 'JOGADOR').toUpperCase(), W / 2, 1200); ctx.shadowBlur = 0
    ctx.font = '46px Inter'; ctx.fillStyle = '#ffd7ec'; ctx.fillText(votos || '', W / 2, 1268)
    if (logoRef.current) { const lw = 140, lh = lw * logoRef.current.naturalHeight / logoRef.current.naturalWidth; ctx.drawImage(logoRef.current, 40, H - lh - 30, lw, lh) }
  }

  function escolherFoto(e) { const f = e.target.files?.[0]; if (!f) return; const img = new Image(); img.onload = () => { fotoRef.current = img; desenhar() }; img.src = URL.createObjectURL(f) }
  async function gerarFundoIA() {
    setGerandoIA(true)
    try {
      const resp = await fetch(urlFundoIA(Math.floor(Math.random() * 1e6)))
      if (!resp.ok) throw new Error('HTTP ' + resp.status)
      const blob = await resp.blob()
      const img = new Image()
      img.onload = () => { fundoRef.current = img; setGerandoIA(false); desenhar() }
      img.onerror = () => { setGerandoIA(false); alert('A imagem da IA veio quebrada. Tenta de novo.') }
      img.src = URL.createObjectURL(blob)
    } catch (e) {
      setGerandoIA(false)
      alert('A IA (serviço grátis) não respondeu agora — costuma demorar ou limitar. O card já fica ótimo sem ela; tenta de novo em instantes se quiser o fundo IA.')
    }
  }
  function baixar() {
    try { const a = document.createElement('a'); a.download = 'pe-de-rato.png'; a.href = canvasRef.current.toDataURL('image/png'); a.click() }
    catch { alert('Não consegui exportar por causa da arte da IA. Gere sem o fundo IA ou tente outra arte.') }
  }

  return (
    <div className="card-tools">
      <label className="file-btn">📸 Escolher foto do jogador<input type="file" accept="image/*" onChange={escolherFoto} /></label>
      <input className="txt" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do pé de rato" />
      <input className="txt" value={votos} onChange={(e) => setVotos(e.target.value)} placeholder="Ex: 7 votos da resenha" />
      <canvas ref={canvasRef} width="1080" height="1350" className="card-canvas" />
      <div className="row" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn ghost" style={{ flex: 1, margin: 0 }} onClick={gerarFundoIA} disabled={gerandoIA}>{gerandoIA ? '🎨 Gerando…' : '🎨 Fundo IA (grátis)'}</button>
        {fundoRef.current && <button className="btn ghost" style={{ flex: '0 0 auto', margin: 0 }} onClick={() => { fundoRef.current = null; desenhar() }}>Tirar</button>}
      </div>
      <button className="btn" style={{ marginTop: 8 }} onClick={baixar}>Baixar imagem pro zap</button>
    </div>
  )
}
