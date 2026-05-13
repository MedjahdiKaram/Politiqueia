import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Idéoscope',
    default: 'Idéoscope – Analyse de corpus discursifs par IA',
  },
  description:
    'Plateforme d\'analyse discursive et d\'interprétation idéologique assistée par intelligence artificielle. Détection des orientations idéologiques, stratégies discursives et interprétation contextualisée.',
  keywords: [
    'analyse discursive', 'corpus politique', 'idéologie', 'IA', 'sciences du langage',
    'SHS', 'recherche', 'observatoire politique', 'discours',
  ],
  authors: [{ name: 'Hind Chohra' }],
}

export default function LayoutRacine({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
