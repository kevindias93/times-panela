import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'

const TEMAS = {
  rato: {
    titulo: ['PÉ DE RATO', 'DA RODADA!'], sub: '🐀   vencedor de hoje   🏆',
    subCor: '#ffd24a', anel: '#ffd24a', nomeCor: '#ffd7ec', arquivo: 'pe-de-rato.png',
    fundo: 'grafite',
    prompt: 'graffiti street art brick wall, spray paint splatter, sneaky cartoon rat mascot, golden trophy, purple magenta blue neon palette, urban night, vertical poster background, no text, no letters',
  },
  craque: {
    titulo: ['CRAQUE', 'DA RODADA!'], sub: '⭐   melhor de hoje   🏆',
    subCor: '#ffe08a', anel: '#F5B841', nomeCor: '#ffe9bd', arquivo: 'craque-da-rodada.png',
    fundo: 'ouro',
    prompt: 'golden trophy on a pedestal, stadium floodlights, confetti, spotlight beams, sparkles, luxury gold and black background, football, vertical poster, no text, no letters',
  },
}
function urlIA(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&nologo=true&seed=${seed}`
}

export default function CardPremio({ tema = 'rato', nomeInicial = '', votosInicial = '' }) {
  const t = TEMAS[tema] || TEMAS.rato
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
  function rnd(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280 }

  function fundoGrafite(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#3a1050'); g.addColorStop(.5, '#7d1e6a'); g.addColorStop(1, '#c21f5b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 3
    for (let y = 0; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    for (let y = 0, row = 0; y < H; y += 70, row++) for (let x = (row % 2 ? 0 : 110); x < W; x += 220) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 70); ctx.stroke() }
    const r = rnd(7), cores = ['rgba(255,60,160,.5)', 'rgba(90,220,255,.35)', 'rgba(255,210,74,.4)']
    for (let i = 0; i < 90; i++) { ctx.fillStyle = cores[i % 3]; ctx.beginPath(); ctx.arc(r() * W, r() * H, r() * 10 + 1, 0, 7); ctx.fill() }
  }
  function fundoOuro(ctx, W, H) {
    ctx.fillStyle = '#0b0b0d'; ctx.fillRect(0, 0, W, H)
    const rg = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.42, W * 0.9)
    rg.addColorStop(0, 'rgba(245,184,65,.55)'); rg.addColorStop(.5, 'rgba(120,80,10,.25)'); rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
    ctx.save(); ctx.translate(W / 2, -60); ctx.globalAlpha = .10; ctx.fillStyle = '#F5B841'
    for (let i = 0; i < 12; i++) { ctx.rotate((Math.PI) / 12); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, H * 1.4); ctx.lineTo(40, H * 1.4); ctx.fill() }
    ctx.restore()
    const r = rnd(3); ctx.fillStyle = 'rgba(255,225,150,.9)'
    for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, s = r() * 3 + 1; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill() }
  }

  function patas(ctx, x, y, s) {
    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.beginPath(); ctx.ellipse(x, y, s, s * 1.3, 0, 0, 7); ctx.fill()
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(x + i * s * 0.9, y - s * 1.5, s * 0.4, s * 0.6, 0, 0, 7); ctx.fill() }
  }

  async function desenhar() {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); const W = 1080, H = 1350
    if (document.fonts?.ready) await document.fonts.ready
    if (fundoRef.current) { cover(ctx, fundoRef.current, 0, 0, W, H); ctx.fillStyle = 'rgba(12,6,20,.45)'; ctx.fillRect(0, 0, W, H) }
    else if (t.fundo === 'ouro') fundoOuro(ctx, W, H)
    else fundoGrafite(ctx, W, H)

    ctx.textAlign = 'center'
    if (tema === 'rato') { patas(ctx, 150, 150, 26); patas(ctx, W - 150, 190, 22) }

    ctx.save(); ctx.translate(W / 2, 250); ctx.rotate(-0.05)
    ctx.font = '160px Bangers'; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(0,0,0,.45)'
    ctx.strokeText(t.titulo[0], 0, 0); ctx.strokeText(t.titulo[1], 0, 160)
    ctx.fillStyle = tema === 'craque' ? '#F5D67A' : '#fff'; ctx.fillText(t.titulo[0], 0, 0)
    ctx.fillStyle = '#fff'; ctx.fillText(t.titulo[1], 0, 160); ctx.restore()

    ctx.font = '58px Bangers'; ctx.fillStyle = t.subCor; ctx.fillText(t.sub, W / 2, 560)

    const cx = W / 2, cy = 840, r = 240
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.closePath()
    if (fotoRef.current) { ctx.save(); ctx.clip(); cover(ctx, fotoRef.current, cx - r, cy - r, r * 2, r * 2); ctx.restore() }
    else { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '120px Anton'; ctx.fillText('?', cx, cy + 42) }
    ctx.lineWidth = 18; ctx.strokeStyle = '#fff'; ctx.stroke()
    ctx.lineWidth = 6; ctx.strokeStyle = t.anel; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.stroke(); ctx.restore()

    ctx.font = '100px Anton'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 10
    ctx.fillText((nome || 'JOGADOR').toUpperCase(), W / 2, 1200); ctx.shadowBlur = 0
    ctx.font = '46px Inter'; ctx.fillStyle = t.nomeCor; ctx.fillText(votos || '', W / 2, 1268)
    if (logoRef.current) { const lw = 140, lh = lw * logoRef.current.naturalHeight / logoRef.current.naturalWidth; ctx.drawImage(logoRef.current, 40, H - lh - 30, lw, lh) }
  }

  function escolherFoto(e) { const f = e.target.files?.[0]; if (!f) return; const img = new Image(); img.onload = () => { fotoRef.current = img; desenhar() }; img.src = URL.createObjectURL(f) }
  async function gerarFundoIA() {
    setGerandoIA(true)
    try {
      const resp = await fetch(urlIA(t.prompt, Math.floor(Math.random() * 1e6)))
      if (!resp.ok) throw new Error('HTTP ' + resp.status)
      const blob = await resp.blob(); const img = new Image()
      img.onload = () => { fundoRef.current = img; setGerandoIA(false); desenhar() }
      img.onerror = () => { setGerandoIA(false); alert('A imagem da IA veio quebrada. Tenta de novo.') }
      img.src = URL.createObjectURL(blob)
    } catch { setGerandoIA(false); alert('A IA (serviço grátis) não respondeu agora. O card já fica ótimo sem ela; tenta de novo se quiser.') }
  }
  function baixar() {
    try { const a = document.createElement('a'); a.download = t.arquivo; a.href = canvasRef.current.toDataURL('image/png'); a.click() }
    catch { alert('Não consegui exportar por causa da arte da IA. Gere sem o fundo IA ou tente outra arte.') }
  }

  return (
    <div className="card-tools">
      <label className="file-btn">📸 Escolher foto do jogador<input type="file" accept="image/*" onChange={escolherFoto} /></label>
      <input className="txt" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
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