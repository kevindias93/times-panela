// Cada time: 1 goleiro, 2 zagueiros, 3 meias, 1 atacante. Máximo de 2 times; resto no banco.
export const FORMACAO = { GOL: 1, ZAG: 2, MEI: 3, ATA: 1 }
export const POSICOES = ['GOL', 'ZAG', 'MEI', 'ATA']
export const MAX_TIMES = 2
export const TAMANHO_TIME = Object.values(FORMACAO).reduce((a, b) => a + b, 0) // 7
export const ROTULO_POSICAO = { GOL: 'Goleiro', ZAG: 'Zagueiro', MEI: 'Meia', ATA: 'Atacante' }

function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Tenta preencher n times usando posição primária e, nas faltas, a secundária.
function tentarMontar(confirmados, n) {
  const precisa = {}; POSICOES.forEach((p) => { precisa[p] = FORMACAO[p] * n })
  const livres = new Set(confirmados.map((p) => p.id))
  const alocados = {}; POSICOES.forEach((p) => { alocados[p] = [] })

  // 1) posição primária, melhores primeiro
  for (const pos of POSICOES) {
    const cand = embaralhar(confirmados.filter((p) => livres.has(p.id) && p.posicao === pos))
      .sort((a, b) => (b.habilidade || 3) - (a.habilidade || 3))
    while (alocados[pos].length < precisa[pos] && cand.length) {
      const p = cand.shift(); alocados[pos].push({ ...p, posicao: pos }); livres.delete(p.id)
    }
  }
  // 2) preenche faltas com quem tem aquela posição como secundária
  for (const pos of POSICOES) {
    if (alocados[pos].length >= precisa[pos]) continue
    const cand = embaralhar(confirmados.filter((p) => livres.has(p.id) && p.posicaoSecundaria === pos))
      .sort((a, b) => (b.habilidade || 3) - (a.habilidade || 3))
    while (alocados[pos].length < precisa[pos] && cand.length) {
      const p = cand.shift(); alocados[pos].push({ ...p, posicao: pos, viaSecundaria: true }); livres.delete(p.id)
    }
  }
  const ok = POSICOES.every((pos) => alocados[pos].length === precisa[pos])
  return { ok, alocados, livres }
}

export function maxTimes(confirmados) {
  const teto = Math.min(MAX_TIMES, Math.floor(confirmados.length / TAMANHO_TIME))
  for (let n = teto; n >= 1; n--) if (tentarMontar(confirmados, n).ok) return n
  return 0
}

export function faltando(confirmados) {
  if (maxTimes(confirmados) >= MAX_TIMES) return []
  const alvo = maxTimes(confirmados) + 1
  const m = tentarMontar(confirmados, alvo)
  return POSICOES.map((pos) => ({ pos, falta: FORMACAO[pos] * alvo - m.alocados[pos].length })).filter((x) => x.falta > 0)
}

export function sortearTimes(confirmados) {
  const nTimes = maxTimes(confirmados)
  if (nTimes < 1) return { times: [], banco: confirmados, nTimes: 0 }
  const m = tentarMontar(confirmados, nTimes)

  const times = Array.from({ length: nTimes }, (_, i) => ({ id: i + 1, jogadores: [], forca: 0 }))
  for (const pos of POSICOES) {
    const ordem = embaralhar([...Array(nTimes).keys()])
    m.alocados[pos].forEach((jog, idx) => {
      const rodada = Math.floor(idx / nTimes), passo = idx % nTimes
      const slot = rodada % 2 === 0 ? passo : nTimes - 1 - passo
      const t = ordem[slot]
      times[t].jogadores.push(jog)
      times[t].forca += jog.habilidade || 3
    })
  }
  const banco = confirmados.filter((p) => m.livres.has(p.id))
  return { times, banco, nTimes }
}

// Habilidade = média das avaliações da galera (por uid). Sem votos, cai no valor inicial.
export function mediaHab(j) {
  const v = j?.habVotos ? Object.values(j.habVotos) : []
  if (v.length) return v.reduce((a, b) => a + b, 0) / v.length
  return j?.habilidade || 3
}
export function qtdHab(j) { return j?.habVotos ? Object.keys(j.habVotos).length : 0 }
