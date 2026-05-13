'use client'

import { useRef, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'

const ToileDiscursive = dynamic(() => import('./ToileDiscursive'), { ssr: false })

// ── Mots-clés flottants ────────────────────────────────────────────────────────
const MOTS = [
  { texte: 'Idéologie',    top: '11%', left: '58%', cls: 'text-blue-400',    delai: 1.1, opacite: 0.3  },
  { texte: 'Rhétorique',   top: '27%', left: '70%', cls: 'text-orange-400',  delai: 1.6, opacite: 0.26 },
  { texte: 'Polarisation', top: '63%', left: '63%', cls: 'text-orange-400',  delai: 2.0, opacite: 0.24 },
  { texte: 'Sémantique',   top: '79%', left: '56%', cls: 'text-blue-400',    delai: 1.3, opacite: 0.27 },
  { texte: 'Corpus',       top: '17%', left: '42%', cls: 'text-slate-400',   delai: 0.9, opacite: 0.18 },
  { texte: 'Discours',     top: '47%', left: '53%', cls: 'text-emerald-400', delai: 1.7, opacite: 0.21 },
  { texte: 'Paradigme',    top: '89%', left: '74%', cls: 'text-slate-400',   delai: 2.2, opacite: 0.15 },
  { texte: 'Hégémonie',    top: '74%', left: '44%', cls: 'text-blue-400',    delai: 1.8, opacite: 0.16 },
] as const

// ── Métriques analytiques ──────────────────────────────────────────────────────
const METRIQUES = [
  { label: 'Tensions idéologiques',    valeur: 72, barCls: 'bg-orange-400', textCls: 'text-orange-400', delai: 1.0 },
  { label: 'Rhétorique argumentative', valeur: 84, barCls: 'bg-blue-500',   textCls: 'text-blue-400',   delai: 1.2 },
  { label: 'Consensus discursif',      valeur: 38, barCls: 'bg-emerald-500',textCls: 'text-emerald-400',delai: 1.4 },
] as const

const STRATEGIES = [
  { texte: 'Pathos — appel émotionnel', done: true  },
  { texte: 'Ethos institutionnel',       done: true  },
  { texte: 'Logos — raisonnement',       done: false },
] as const

// ── Variants framer-motion ─────────────────────────────────────────────────────
const conteneurVar = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
}
const elementVar = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
}

// ── Bouton CTA avec effet shimmer + scale ──────────────────────────────────────
function CTALink({
  href, children, variante = 'primaire',
}: { href: string; children: ReactNode; variante?: 'primaire' | 'secondaire' }) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold transition-all duration-300 ${
          variante === 'primaire'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 hover:bg-blue-500 hover:shadow-blue-600/60 hover:shadow-xl'
            : 'border border-white/20 bg-white/5 text-slate-200 backdrop-blur-sm hover:bg-white/10 hover:border-white/35'
        }`}
      >
        {/* Shimmer sweep */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        {children}
      </Link>
    </motion.div>
  )
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function HeroDiscursif() {
  const reduire   = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Parallax au scroll
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const yTexte     = useTransform(scrollYProgress, [0, 1], ['0%',  '25%'])
  const yPanneau   = useTransform(scrollYProgress, [0, 1], ['0%',  '15%'])
  const opacite    = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const flou       = useTransform(scrollYProgress, [0, 0.6], [0, 12])
  const flouFilter = useTransform(flou, (v) => `blur(${v}px)`)

  // Tilt du panneau selon la souris
  const rotX = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 })
  const rotY = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduire) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width  - 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5
    rotX.set(-cy * 14)
    rotY.set(cx * 14)
  }
  const onMouseLeave = () => { rotX.set(0); rotY.set(0) }

  return (
    <section
      ref={sectionRef}
      className="hero-discursif relative overflow-hidden text-white"
      style={{ minHeight: '100vh' }}
    >
      {/* Toile neuronale */}
      <ToileDiscursive />

      {/* Grille */}
      <div className="hero-grille absolute inset-0 opacity-[0.035]" aria-hidden="true" />

      {/* Halo central */}
      <div className="hero-halo-central absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full" aria-hidden="true" />

      {/* Mots-clés flottants */}
      {!reduire && MOTS.map((m, i) => (
        <motion.span
          key={i}
          className={`absolute text-[11px] font-mono pointer-events-none hidden lg:block select-none tracking-wide ${m.cls}`}
          style={{ top: m.top, left: m.left }}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, m.opacite, m.opacite * 0.6, m.opacite],
            y: [10, 0, -6, 0, 6, 0],
          }}
          transition={{
            opacity: { duration: 1, delay: m.delai },
            y: { duration: 10 + i * 0.8, delay: m.delai, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {m.texte}
        </motion.span>
      ))}

      {/* ── Contenu ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 flex items-center min-h-screen">
        <div className="grid grid-cols-1 items-center gap-16 w-full lg:grid-cols-2 lg:gap-10">

          {/* ── Texte (parallax vers le haut) ───────────────────────────── */}
          <motion.div
            style={reduire ? {} : { y: yTexte, opacity: opacite, filter: flouFilter }}
          >
            <motion.div initial={reduire ? false : 'hidden'} animate="visible" variants={conteneurVar}>

              {/* Badge */}
              <motion.div variants={elementVar} className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 backdrop-blur-sm">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs font-medium text-blue-300 tracking-wide">
                    Procédé scientifique formalisé · IA + Sciences du Langage
                  </span>
                </div>
              </motion.div>

              {/* Titre */}
              <motion.h1
                variants={elementVar}
                className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.4rem]"
              >
                Décrypter la complexité
                <br />
                <motion.span
                  className="text-blue-400 inline-block"
                  animate={reduire ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  style={{
                    background: 'linear-gradient(90deg, #60a5fa, #818cf8, #3b82f6, #60a5fa)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                >
                  idéologique
                </motion.span>{' '}
                des{' '}
                <motion.span
                  className="text-orange-400 inline-block"
                  animate={reduire ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  style={{
                    background: 'linear-gradient(90deg, #fb923c, #fbbf24, #f97316, #fb923c)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                >
                  discours
                </motion.span>
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                variants={elementVar}
                className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300"
              >
                Une plateforme scientifique d&apos;analyse discursive alimentée par
                l&apos;intelligence artificielle et les sciences du langage — pour
                transformer des corpus complexes en compréhension stratégique.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={elementVar} className="mt-10 flex flex-wrap gap-4">
                <CTALink href="/inscription" variante="primaire">
                  Explorer la plateforme
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </CTALink>
                <CTALink href="#fonctionnalites" variante="secondaire">
                  Découvrir la méthodologie
                  <ChevronRight className="h-4 w-4" />
                </CTALink>
              </motion.div>

              {/* Stats */}
              <motion.div variants={elementVar} className="mt-14 flex flex-wrap gap-10">
                {([
                  { v: '2 000+', l: 'corpus analysés',       c: 'from-blue-400 to-blue-300' },
                  { v: '98 %',   l: 'précision sémantique',  c: 'from-emerald-400 to-emerald-300' },
                  { v: '< 60 s', l: 'par analyse',            c: 'from-orange-400 to-orange-300' },
                ] as const).map((s) => (
                  <motion.div key={s.l} whileHover={{ scale: 1.1 }} className="cursor-default">
                    <p
                      className={`text-2xl font-bold bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}
                    >
                      {s.v}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{s.l}</p>
                  </motion.div>
                ))}
              </motion.div>

            </motion.div>
          </motion.div>

          {/* ── Panneau analytique (tilt souris + parallax) ─────────────── */}
          <motion.div
            className="hidden lg:block"
            style={reduire ? {} : { y: yPanneau }}
            initial={reduire ? false : { opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <motion.div style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }}>
              <PanneauAnalyse reduire={reduire ?? false} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Indicateur de scroll ──────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Défiler</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// ── Panneau d'analyse ─────────────────────────────────────────────────────────
function PanneauAnalyse({ reduire }: { reduire: boolean }) {
  return (
    <div className="relative">
      {/* Halo derrière le panneau */}
      <div
        className="absolute -inset-8 rounded-3xl blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <motion.span
              className="h-2 w-2 rounded-full bg-orange-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              Analyse discursive en cours
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">corpus_001.txt</span>
        </div>

        {/* Extrait corpus */}
        <div className="border-b border-white/10 px-5 py-4">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">Extrait du corpus</p>
          <p className="font-mono text-[11px] leading-relaxed text-slate-400">
            &ldquo;...les politiques{' '}
            <MotSurligné couleur="blue">économiques</MotSurligné>{' '}
            doivent répondre aux{' '}
            <MotSurligné couleur="orange">besoins fondamentaux</MotSurligné>{' '}
            des citoyens, en garantissant une{' '}
            <MotSurligné couleur="green">cohésion sociale</MotSurligné>{' '}
            durable...&rdquo;
          </p>
        </div>

        {/* Métriques */}
        <div className="space-y-3.5 border-b border-white/10 px-5 py-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">Indicateurs analytiques</p>
          {METRIQUES.map((m) => (
            <div key={m.label}>
              <div className="mb-1 flex justify-between">
                <span className="text-[11px] text-slate-400">{m.label}</span>
                <motion.span
                  className={`font-mono text-[11px] ${m.textCls}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduire ? 0 : m.delai }}
                >
                  {m.valeur}%
                </motion.span>
              </div>
              <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${m.barCls}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.valeur}%` }}
                  transition={{ duration: reduire ? 0 : 1.8, delay: reduire ? 0 : m.delai, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stratégies */}
        <div className="px-5 py-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">Stratégies détectées</p>
          <div className="space-y-2.5">
            {STRATEGIES.map((s, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5"
                initial={reduire ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: reduire ? 0 : 1.7 + i * 0.3 }}
              >
                <span className={`text-xs ${s.done ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {s.done ? '✓' : '⟳'}
                </span>
                <span className={`text-[11px] ${s.done ? 'text-slate-300' : 'text-slate-500'}`}>{s.texte}</span>
                {!s.done && (
                  <motion.span
                    className="ml-auto text-[9px] text-orange-400/70"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    en cours…
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pied */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-5 py-2.5">
          <div className="flex gap-2.5">
            <Etiquette couleur="blue">Analyse</Etiquette>
            <Etiquette couleur="orange">Tension</Etiquette>
            <Etiquette couleur="green">Consensus</Etiquette>
          </div>
          <span className="text-[9px] text-slate-600">idéoscope.fr</span>
        </div>
      </div>

      {/* Carte flottante — idéologie */}
      <motion.div
        className="absolute -bottom-7 -right-7 rounded-xl border border-white/10 bg-[#0a1828]/95 px-4 py-3 shadow-2xl backdrop-blur-md"
        animate={reduire ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="mb-1.5 text-[10px] text-slate-500">Idéologie détectée</p>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-blue-500 to-orange-500" />
          <span className="font-mono text-[11px] text-slate-300">Centre-gauche</span>
        </div>
      </motion.div>

      {/* Carte flottante — rapport prêt */}
      <motion.div
        className="absolute -left-7 -top-7 rounded-xl border border-white/10 bg-[#0a1828]/95 px-4 py-3 shadow-2xl backdrop-blur-md"
        animate={reduire ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-[11px] font-medium text-emerald-400">Rapport prêt</p>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-500">Analyse complétée en 42s</p>
      </motion.div>
    </div>
  )
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function MotSurligné({ children, couleur }: { children: ReactNode; couleur: 'blue' | 'orange' | 'green' }) {
  const cls = {
    blue:   'text-blue-400 bg-blue-400/10 rounded px-0.5',
    orange: 'text-orange-400 bg-orange-400/10 rounded px-0.5',
    green:  'text-emerald-400 bg-emerald-400/10 rounded px-0.5',
  }
  return <span className={cls[couleur]}>{children}</span>
}

function Etiquette({ children, couleur }: { children: ReactNode; couleur: 'blue' | 'orange' | 'green' }) {
  const cls = {
    blue:   'bg-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/20 text-orange-400',
    green:  'bg-emerald-500/20 text-emerald-400',
  }
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${cls[couleur]}`}>{children}</span>
}
