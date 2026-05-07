'use client'

import { useEffect } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default function ErreurGlobale({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 font-sans">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
            Erreur critique
          </p>
          <h1 className="text-4xl font-bold text-zinc-900">
            L&apos;application a rencontré une erreur
          </h1>
          <p className="mt-4 text-zinc-500 max-w-sm mx-auto">
            Une erreur critique est survenue. Veuillez rafraîchir la page ou contacter le support si le problème persiste.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="text-xs font-semibold text-red-700 mb-1">Détail de l&apos;erreur (dev)</p>
              <p className="text-xs text-red-600 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-400 mt-1">Digest : {error.digest}</p>
              )}
            </div>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
