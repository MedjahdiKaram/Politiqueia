import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Client Supabase côté serveur pour les utilisateurs connectés.
 * Utilise les cookies de session — respecte les politiques RLS.
 */
export async function creerClientServeur() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré dans les Server Components (lecture seule)
          }
        },
      },
    }
  )
}

/**
 * Client Supabase avec la clé service_role.
 * Contourne TOTALEMENT les politiques RLS — à utiliser uniquement
 * côté serveur pour les opérations d'administration.
 *
 * N'utilise PAS les cookies utilisateur : le service role est une
 * clé secrète qui agit indépendamment de la session utilisateur.
 */
export function creerClientAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}
