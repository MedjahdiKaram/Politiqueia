import { render, screen } from '@testing-library/react'
import { BadgeStatut, Badge } from '@/components/ui/Badge'

describe('BadgeStatut', () => {
  it('affiche le libellé "Brouillon"', () => {
    render(<BadgeStatut statut="brouillon" />)
    expect(screen.getByText('Brouillon')).toBeInTheDocument()
  })

  it('affiche le libellé "Analysé"', () => {
    render(<BadgeStatut statut="analyse" />)
    expect(screen.getByText('Analysé')).toBeInTheDocument()
  })

  it('affiche le libellé "En cours"', () => {
    render(<BadgeStatut statut="en_cours" />)
    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('affiche le libellé "Soumis"', () => {
    render(<BadgeStatut statut="soumis" />)
    expect(screen.getByText('Soumis')).toBeInTheDocument()
  })

  it('applique une classe CSS pour chaque statut', () => {
    const { container } = render(<BadgeStatut statut="analyse" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('green')
  })
})

describe('Badge générique', () => {
  it('affiche le contenu enfant', () => {
    render(<Badge>42</Badge>)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('applique la variante succes', () => {
    render(<Badge variante="succes">OK</Badge>)
    const badge = screen.getByText('OK')
    expect(badge.className).toContain('green')
  })

  it('applique la variante erreur', () => {
    render(<Badge variante="erreur">Erreur</Badge>)
    const badge = screen.getByText('Erreur')
    expect(badge.className).toContain('red')
  })

  it('applique la variante avertissement', () => {
    render(<Badge variante="avertissement">Attention</Badge>)
    const badge = screen.getByText('Attention')
    expect(badge.className).toContain('amber')
  })
})
