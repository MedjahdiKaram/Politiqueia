import {
  formaterDate,
  formaterDateCourte,
  formaterPrix,
  tronquer,
  nettoyerHTML,
  compterCaracteres,
  initiales,
  estEmailValide,
  enrichirAbonnement,
  LIBELLES_STATUT,
  COULEURS_STATUT,
} from '@/lib/utils'
import type { Abonnement } from '@/types'

// ----------------------------------------------------------------
// formaterDate
// ----------------------------------------------------------------
describe('formaterDate', () => {
  it('formate une date ISO en français', () => {
    const result = formaterDate('2024-10-12T00:00:00Z', 'dd MMMM yyyy')
    expect(result).toContain('2024')
  })

  it('formate une date courte correctement', () => {
    const result = formaterDateCourte('2024-12-31T12:00:00Z')
    expect(result).toBe('31/12/2024')
  })
})

// ----------------------------------------------------------------
// formaterPrix
// ----------------------------------------------------------------
describe('formaterPrix', () => {
  it('affiche le prix en DA', () => {
    expect(formaterPrix(2000)).toContain('DA')
    expect(formaterPrix(2000)).toContain('2')
  })

  it('gère les grands nombres', () => {
    expect(formaterPrix(7000)).toContain('7')
  })
})

// ----------------------------------------------------------------
// tronquer
// ----------------------------------------------------------------
describe('tronquer', () => {
  it('ne tronque pas un texte court', () => {
    expect(tronquer('Bonjour', 100)).toBe('Bonjour')
  })

  it('tronque un texte trop long', () => {
    const long = 'a'.repeat(200)
    const result = tronquer(long, 50)
    expect(result.length).toBeLessThanOrEqual(52) // 50 + '…'
    expect(result).toMatch(/…$/)
  })

  it('utilise la longueur par défaut de 100', () => {
    const texte = 'x'.repeat(150)
    const result = tronquer(texte)
    expect(result.length).toBeLessThanOrEqual(102)
  })
})

// ----------------------------------------------------------------
// nettoyerHTML / compterCaracteres
// ----------------------------------------------------------------
describe('nettoyerHTML', () => {
  it('supprime les balises HTML', () => {
    expect(nettoyerHTML('<p>Bonjour <strong>monde</strong></p>')).toBe('Bonjour monde')
  })

  it('remplace &nbsp; par un espace', () => {
    expect(nettoyerHTML('Hello&nbsp;world')).toBe('Hello world')
  })

  it('retourne une chaîne vide pour un HTML sans texte', () => {
    expect(nettoyerHTML('<br/><hr/>')).toBe('')
  })
})

describe('compterCaracteres', () => {
  it('compte correctement les caractères textuels', () => {
    expect(compterCaracteres('<p>Bonjour</p>')).toBe(7)
  })

  it('retourne 0 pour du HTML vide', () => {
    expect(compterCaracteres('<p></p>')).toBe(0)
  })
})

// ----------------------------------------------------------------
// initiales
// ----------------------------------------------------------------
describe('initiales', () => {
  it('génère des initiales en majuscules', () => {
    expect(initiales('jean', 'dupont')).toBe('JD')
  })

  it('fonctionne avec des noms déjà en majuscules', () => {
    expect(initiales('Marie', 'Curie')).toBe('MC')
  })
})

// ----------------------------------------------------------------
// estEmailValide
// ----------------------------------------------------------------
describe('estEmailValide', () => {
  it('accepte un email valide', () => {
    expect(estEmailValide('test@exemple.fr')).toBe(true)
    expect(estEmailValide('jean.dupont@institution.gov.dz')).toBe(true)
  })

  it('rejette un email invalide', () => {
    expect(estEmailValide('pasvalide')).toBe(false)
    expect(estEmailValide('@sansnomde.com')).toBe(false)
    expect(estEmailValide('test@')).toBe(false)
  })
})

// ----------------------------------------------------------------
// LIBELLES_STATUT / COULEURS_STATUT
// ----------------------------------------------------------------
describe('LIBELLES_STATUT', () => {
  it('contient les 4 statuts requis', () => {
    expect(LIBELLES_STATUT.brouillon).toBe('Brouillon')
    expect(LIBELLES_STATUT.soumis).toBe('Soumis')
    expect(LIBELLES_STATUT.en_cours).toBe('En cours')
    expect(LIBELLES_STATUT.analyse).toBe('Analysé')
  })
})

describe('COULEURS_STATUT', () => {
  it('chaque statut a une classe CSS', () => {
    const statuts = ['brouillon', 'soumis', 'en_cours', 'analyse'] as const
    statuts.forEach((s) => {
      expect(typeof COULEURS_STATUT[s]).toBe('string')
      expect(COULEURS_STATUT[s].length).toBeGreaterThan(0)
    })
  })
})

// ----------------------------------------------------------------
// enrichirAbonnement
// ----------------------------------------------------------------
describe('enrichirAbonnement', () => {
  const abonnementBase: Abonnement = {
    id:            'abc-123',
    user_id:       'user-456',
    type:          'premium',
    quota_total:   20,
    quota_utilise: 5,
    date_debut:    new Date(Date.now() - 86400000).toISOString(),  // hier
    date_fin:      new Date(Date.now() + 86400000 * 30).toISOString(), // dans 30 jours
    actif:         true,
    created_at:    new Date().toISOString(),
    updated_at:    new Date().toISOString(),
  }

  it('calcule le quota restant', () => {
    const enrichi = enrichirAbonnement(abonnementBase)
    expect(enrichi.quota_restant).toBe(15)
  })

  it('détecte un abonnement non expiré', () => {
    const enrichi = enrichirAbonnement(abonnementBase)
    expect(enrichi.est_expire).toBe(false)
  })

  it('détecte un abonnement expiré', () => {
    const expire: Abonnement = {
      ...abonnementBase,
      date_fin: new Date(Date.now() - 86400000).toISOString(),
    }
    const enrichi = enrichirAbonnement(expire)
    expect(enrichi.est_expire).toBe(true)
    expect(enrichi.jours_restants).toBe(0)
  })

  it('ne retourne pas un quota négatif', () => {
    const surQuota: Abonnement = {
      ...abonnementBase,
      quota_utilise: 25,
    }
    const enrichi = enrichirAbonnement(surQuota)
    expect(enrichi.quota_restant).toBe(0)
  })
})
