'use client'

import { useEffect, useRef } from 'react'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bleu:    '#3b82f6',
  orange:  '#f97316',
  vert:    '#22c55e',
  ardoise: '#475569',
} as const

type TypeNoeud = 'analyse' | 'tension' | 'consensus' | 'neutre'

interface Noeud {
  x: number; y: number; vx: number; vy: number
  r: number; couleur: string
  alpha: number; alphaMax: number
  pulse: number; pulseV: number
  type: TypeNoeud
  masse: number
}

interface Lien { a: number; b: number; progress: number; speed: number; couleur: string; alpha: number }
interface Particule { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; couleur: string; size: number }
interface Eclat { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; couleur: string; size: number }

const COULEUR_TYPE: Record<TypeNoeud, string> = {
  analyse:   C.bleu,
  tension:   C.orange,
  consensus: C.vert,
  neutre:    C.ardoise,
}

function mkNoeud(w: number, h: number, i: number): Noeud {
  const types: TypeNoeud[] = ['analyse', 'tension', 'consensus', 'neutre']
  const type = types[i % 4]
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    r: 2 + Math.random() * 3,
    couleur: COULEUR_TYPE[type],
    alpha: 0, alphaMax: 0.45 + Math.random() * 0.35,
    pulse: Math.random() * Math.PI * 2,
    pulseV: 0.007 + Math.random() * 0.012,
    type, masse: 0.8 + Math.random() * 1.2,
  }
}

export default function ToileDiscursive() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef(0)
  const sourisRef  = useRef({ x: -9999, y: -9999, active: false })
  const scrollRef  = useRef(0)
  const eclatsRef  = useRef<Eclat[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let noeuds: Noeud[] = []
    let liens: Lien[] = []
    let particules: Particule[] = []
    let t = 0
    let scrollBoost = 0

    // ── Init ──────────────────────────────────────────────────────────────────
    const init = (w: number, h: number) => {
      const n = Math.min(36, Math.max(16, Math.floor(w / 36)))
      noeuds = Array.from({ length: n }, (_, i) => mkNoeud(w, h, i))
      liens = []
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = noeuds[i].x - noeuds[j].x
          const dy = noeuds[i].y - noeuds[j].y
          if (Math.sqrt(dx * dx + dy * dy) < w * 0.26 && Math.random() > 0.45) {
            const ta = noeuds[i].type, tb = noeuds[j].type
            let couleur: string = C.bleu
            if (ta === 'tension' || tb === 'tension') couleur = C.orange
            else if (ta === 'consensus' || tb === 'consensus') couleur = C.vert
            liens.push({ a: i, b: j, progress: Math.random(), speed: 0.0014 + Math.random() * 0.002, couleur, alpha: 0 })
          }
        }
      }
      particules = []
    }

    const spawner = (w: number, h: number) => {
      if (particules.length >= 45) return
      const c = [C.bleu, C.orange, C.vert][Math.floor(Math.random() * 3)]
      particules.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        life: 0, maxLife: 220 + Math.random() * 300,
        couleur: c, size: 0.9 + Math.random() * 1.5,
      })
    }

    // ── Explosion au scroll ───────────────────────────────────────────────────
    const exploser = (cx: number, cy: number, nb: number, force: number) => {
      const couleurs = [C.bleu, C.orange, C.vert, '#ffffff']
      for (let i = 0; i < nb; i++) {
        const angle = (Math.PI * 2 * i) / nb + Math.random() * 0.5
        const v = force * (0.5 + Math.random())
        eclatsRef.current.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0, maxLife: 40 + Math.random() * 50,
          couleur: couleurs[i % couleurs.length],
          size: 1.5 + Math.random() * 2.5,
        })
      }
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      init(canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Handlers souris ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      sourisRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
    }
    const onMouseLeave = () => { sourisRef.current = { x: -9999, y: -9999, active: false } }
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      exploser(cx, cy, 24, 4.5)
    }

    // ── Handler scroll ────────────────────────────────────────────────────────
    let lastScrollY = window.scrollY
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY)
      if (delta > 2) {
        scrollBoost = Math.min(scrollBoost + delta * 0.015, 2)
        // Explosion aléatoire sur scroll rapide
        if (delta > 20 && canvas.width > 0) {
          exploser(
            Math.random() * canvas.width,
            Math.random() * canvas.height * 0.6,
            12, 2.5
          )
        }
      }
      lastScrollY = window.scrollY
    }

    const section = canvas.parentElement
    if (section) {
      section.addEventListener('mousemove', onMouseMove)
      section.addEventListener('mouseleave', onMouseLeave)
      section.addEventListener('click', onClick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Boucle principale ─────────────────────────────────────────────────────
    const draw = () => {
      t++
      scrollBoost *= 0.96
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (t % 55 === 0) spawner(w, h)

      const { x: mx, y: my, active } = sourisRef.current
      const REPULSION  = 140
      const ATTRACTION = 320

      // ── Nœuds ─────────────────────────────────────────────────────────────
      for (const n of noeuds) {
        // Force souris
        if (active) {
          const dx = n.x - mx, dy = n.y - my
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < REPULSION && d > 0) {
            const f = ((REPULSION - d) / REPULSION) * 0.07 / n.masse
            n.vx += (dx / d) * f
            n.vy += (dy / d) * f
          } else if (d < ATTRACTION && d > REPULSION) {
            const f = 0.003 / n.masse
            n.vx -= (dx / d) * f
            n.vy -= (dy / d) * f
          }
        }

        // Boost scroll
        n.vx += (Math.random() - 0.5) * scrollBoost * 0.04
        n.vy += (Math.random() - 0.5) * scrollBoost * 0.04

        // Friction & vitesse max
        n.vx *= 0.97; n.vy *= 0.97
        const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        const vMax = 1.8 + scrollBoost * 0.6
        if (sp > vMax) { n.vx = (n.vx / sp) * vMax; n.vy = (n.vy / sp) * vMax }

        n.x += n.vx; n.y += n.vy
        n.pulse += n.pulseV
        n.alpha = Math.min(n.alpha + 0.003, n.alphaMax * (1 + scrollBoost * 0.3))

        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        n.x = Math.max(0, Math.min(w, n.x))
        n.y = Math.max(0, Math.min(h, n.y))

        const pr = n.r + Math.sin(n.pulse) * 1.6 + scrollBoost * 0.5

        // Halo
        const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pr * 6)
        gr.addColorStop(0, n.couleur + '50')
        gr.addColorStop(0.5, n.couleur + '18')
        gr.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(n.x, n.y, pr * 6, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.globalAlpha = n.alpha * 0.6
        ctx.fill()

        // Cercle
        ctx.beginPath()
        ctx.arc(n.x, n.y, pr, 0, Math.PI * 2)
        ctx.fillStyle = n.couleur
        ctx.globalAlpha = n.alpha
        ctx.fill()

        // Anneau tension
        if (n.type === 'tension') {
          ctx.beginPath()
          ctx.arc(n.x, n.y, pr * 2.8, 0, Math.PI * 2)
          ctx.strokeStyle = n.couleur
          ctx.globalAlpha = n.alpha * 0.3
          ctx.lineWidth = 0.8
          ctx.stroke()
        }

        // Spotlight si proche souris
        if (active) {
          const d = Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2)
          if (d < 80) {
            ctx.beginPath()
            ctx.arc(n.x, n.y, pr * 4, 0, Math.PI * 2)
            ctx.fillStyle = n.couleur
            ctx.globalAlpha = (1 - d / 80) * 0.35
            ctx.fill()
          }
        }

        ctx.globalAlpha = 1
      }

      // ── Liens ─────────────────────────────────────────────────────────────
      for (const l of liens) {
        l.progress += l.speed * (1 + scrollBoost * 0.5)
        if (l.progress > 1) l.progress = 0
        l.alpha = Math.min(l.alpha + 0.003, 0.22 + scrollBoost * 0.08)

        const na = noeuds[l.a], nb = noeuds[l.b]
        const tx = na.x + (nb.x - na.x) * l.progress
        const ty = na.y + (nb.y - na.y) * l.progress

        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y)
        ctx.strokeStyle = l.couleur
        ctx.globalAlpha = l.alpha * 0.3
        ctx.lineWidth = 0.6
        ctx.stroke()

        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(tx, ty)
        ctx.globalAlpha = l.alpha
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.beginPath(); ctx.arc(tx, ty, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = l.couleur
        ctx.globalAlpha = l.alpha * 3
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // ── Particules ─────────────────────────────────────────────────────────
      for (let i = particules.length - 1; i >= 0; i--) {
        const p = particules[i]
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > h) { particules.splice(i, 1); continue }
        const prog = p.life / p.maxLife
        const a = prog < 0.12 ? prog / 0.12 : prog > 0.85 ? (1 - prog) / 0.15 : 1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.couleur; ctx.globalAlpha = a * 0.3; ctx.fill(); ctx.globalAlpha = 1
      }

      // ── Éclats (explosions souris/scroll) ──────────────────────────────────
      const eclats = eclatsRef.current
      for (let i = eclats.length - 1; i >= 0; i--) {
        const e = eclats[i]
        e.x += e.vx; e.y += e.vy
        e.vx *= 0.93; e.vy *= 0.93
        e.life++
        if (e.life > e.maxLife) { eclats.splice(i, 1); continue }
        const prog = e.life / e.maxLife
        const a = prog < 0.15 ? prog / 0.15 : 1 - prog
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size * (1 - prog * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = e.couleur; ctx.globalAlpha = a * 0.95; ctx.fill()

        // Traîne lumineuse
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - e.vx * 4, e.y - e.vy * 4)
        ctx.strokeStyle = e.couleur; ctx.globalAlpha = a * 0.5; ctx.lineWidth = e.size * 0.5; ctx.stroke()
        ctx.globalAlpha = 1
      }

      // ── Halo souris ────────────────────────────────────────────────────────
      if (active && mx > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 220)
        g.addColorStop(0, 'rgba(59,130,246,0.12)')
        g.addColorStop(0.5, 'rgba(59,130,246,0.04)')
        g.addColorStop(1, 'rgba(59,130,246,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      if (section) {
        section.removeEventListener('mousemove', onMouseMove)
        section.removeEventListener('mouseleave', onMouseLeave)
        section.removeEventListener('click', onClick)
      }
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
