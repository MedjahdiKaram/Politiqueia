import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROUTES_PUBLIQUES = ['/', '/connexion', '/inscription', '/mot-de-passe-oublie']
const ROUTES_ADMIN = ['/admin']
const ROUTES_AUTHENTIFIEES = ['/tableau-de-bord', '/discours', '/abonnement']

export async function middleware(requete: NextRequest) {
  let reponse = NextResponse.next({
    request: requete,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requete.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            requete.cookies.set(name, value)
          )
          reponse = NextResponse.next({ request: requete })
          cookiesToSet.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const chemin = requete.nextUrl.pathname

  // Rediriger les utilisateurs non authentifiés vers la connexion
  const estRouteProtegee =
    ROUTES_AUTHENTIFIEES.some((r) => chemin.startsWith(r)) ||
    ROUTES_ADMIN.some((r) => chemin.startsWith(r))

  if (estRouteProtegee && !user) {
    return NextResponse.redirect(new URL('/connexion', requete.url))
  }

  // Rediriger les utilisateurs connectés depuis les pages auth
  const estPageAuth = ['/connexion', '/inscription'].includes(chemin)
  if (estPageAuth && user) {
    return NextResponse.redirect(new URL('/tableau-de-bord', requete.url))
  }

  // Vérifier le rôle admin pour les routes admin
  if (ROUTES_ADMIN.some((r) => chemin.startsWith(r)) && user) {
    // createServerClient avec la clé service_role contourne le RLS (Edge-compatible)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: profil } = await supabaseAdmin
      .from('profiles')
      .select('role, actif')
      .eq('id', user.id)
      .single()

    if (!profil || profil.role !== 'admin') {
      return NextResponse.redirect(new URL('/tableau-de-bord', requete.url))
    }

    if (!profil.actif) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/connexion?erreur=compte-desactive', requete.url))
    }
  }

  return reponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
