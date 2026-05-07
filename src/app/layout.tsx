import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Politiqueia',
    default: 'Politiqueia – Évaluation de discours politique par IA',
  },
  description:
    "Plateforme d'analyse et d'évaluation de discours politiques assistée par intelligence artificielle.",
  keywords: ['discours politique', 'analyse IA', 'évaluation', 'rhétorique', 'intelligence artificielle'],
  authors: [{ name: 'Hind Chohra' }],
}

export default function LayoutRacine({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
