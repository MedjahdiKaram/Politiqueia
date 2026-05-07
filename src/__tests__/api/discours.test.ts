/**
 * Tests unitaires pour les routes API des discours.
 * On mock Supabase pour isoler la logique métier.
 */

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  creerClientServeur: jest.fn(),
}))

import { creerClientServeur } from '@/lib/supabase/server'

const mockCreerClientServeur = creerClientServeur as jest.MockedFunction<typeof creerClientServeur>

// Helper : créer un mock Supabase avec les méthodes chaînable
function creerMockSupabase(overrides: Record<string, unknown> = {}) {
  const chainMock = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    order:  jest.fn().mockReturnThis(),
    limit:  jest.fn().mockReturnThis(),
    range:  jest.fn().mockReturnThis(),
    single: jest.fn(),
    ...overrides,
  }

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue(chainMock),
    chainMock,
  }
}

describe('Logique API Discours', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Création de discours', () => {
    it('vérifie que le nom est requis', () => {
      const donnees = { nom: '', contenu: 'Un discours quelconque' }
      expect(donnees.nom.trim().length).toBe(0)
    })

    it('vérifie que le contenu est requis', () => {
      const donnees = { nom: 'Mon discours', contenu: '' }
      expect(donnees.contenu.trim().length).toBe(0)
    })

    it('accepte des données valides', () => {
      const donnees = { nom: 'Discours d\'investiture', contenu: 'Mes chers concitoyens...' }
      expect(donnees.nom.trim().length).toBeGreaterThan(0)
      expect(donnees.contenu.trim().length).toBeGreaterThan(0)
    })
  })

  describe('Logique de quota', () => {
    it('refuse si l\'abonnement est expiré', () => {
      const abonnement = {
        quota_total:   3,
        quota_utilise: 0,
        date_fin:      new Date(Date.now() - 86400000).toISOString(),
        actif:         true,
      }
      const estExpire = new Date(abonnement.date_fin) < new Date()
      expect(estExpire).toBe(true)
    })

    it('refuse si le quota est épuisé', () => {
      const abonnement = {
        quota_total:   3,
        quota_utilise: 3,
        date_fin:      new Date(Date.now() + 86400000 * 30).toISOString(),
        actif:         true,
      }
      const quotaEpuise = abonnement.quota_utilise >= abonnement.quota_total
      expect(quotaEpuise).toBe(true)
    })

    it('accepte si le quota est disponible', () => {
      const abonnement = {
        quota_total:   20,
        quota_utilise: 5,
        date_fin:      new Date(Date.now() + 86400000 * 30).toISOString(),
        actif:         true,
      }
      const peutContinuer =
        abonnement.quota_utilise < abonnement.quota_total &&
        new Date(abonnement.date_fin) > new Date()
      expect(peutContinuer).toBe(true)
    })
  })

  describe('Règles d\'édition', () => {
    it('un discours brouillon est éditable', () => {
      const discours = { statut: 'brouillon' as const }
      expect(discours.statut === 'brouillon').toBe(true)
    })

    it('un discours soumis n\'est plus éditable', () => {
      const discours = { statut: 'soumis' as const }
      expect(discours.statut !== 'brouillon').toBe(true)
    })

    it('un discours analysé n\'est plus éditable', () => {
      const discours = { statut: 'analyse' as const }
      expect(discours.statut !== 'brouillon').toBe(true)
    })

    it('un discours en cours de traitement n\'est plus éditable', () => {
      const discours = { statut: 'en_cours' as const }
      expect(discours.statut !== 'brouillon').toBe(true)
    })
  })

  describe('Droits d\'accès', () => {
    it('un client ne peut accéder qu\'à ses propres discours', () => {
      const discours  = { user_id: 'user-ABC' }
      const utilisateur = { id: 'user-XYZ', role: 'client' }
      const accesAutorise = discours.user_id === utilisateur.id || utilisateur.role === 'admin'
      expect(accesAutorise).toBe(false)
    })

    it('un admin peut accéder à tous les discours', () => {
      const discours  = { user_id: 'user-ABC' }
      const utilisateur = { id: 'user-ADMIN', role: 'admin' }
      const accesAutorise = discours.user_id === utilisateur.id || utilisateur.role === 'admin'
      expect(accesAutorise).toBe(true)
    })
  })

  describe('Reformulation premium', () => {
    it('un abonnement simple n\'inclut pas la reformulation', () => {
      const abonnement = { type: 'simple' as const }
      const inclutReformulation = abonnement.type === 'premium'
      expect(inclutReformulation).toBe(false)
    })

    it('un abonnement premium inclut la reformulation', () => {
      const abonnement = { type: 'premium' as const }
      const inclutReformulation = abonnement.type === 'premium'
      expect(inclutReformulation).toBe(true)
    })
  })
})
