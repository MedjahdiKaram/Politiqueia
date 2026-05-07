import { render, screen, fireEvent } from '@testing-library/react'
import Bouton from '@/components/ui/Bouton'

describe('Composant Bouton', () => {
  it('affiche le texte enfant', () => {
    render(<Bouton>Cliquez ici</Bouton>)
    expect(screen.getByText('Cliquez ici')).toBeInTheDocument()
  })

  it('applique la variante primaire par défaut', () => {
    render(<Bouton>Primaire</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-zinc-900')
  })

  it('applique la variante danger', () => {
    render(<Bouton variante="danger">Supprimer</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-red')
  })

  it('applique la variante contour', () => {
    render(<Bouton variante="contour">Contour</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('est désactivé en mode chargement', () => {
    render(<Bouton chargement>Chargement...</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('appelle onClick lorsqu\'on clique', () => {
    const surClic = jest.fn()
    render(<Bouton onClick={surClic}>Cliquer</Bouton>)
    fireEvent.click(screen.getByRole('button'))
    expect(surClic).toHaveBeenCalledTimes(1)
  })

  it('ne déclenche pas onClick quand désactivé', () => {
    const surClic = jest.fn()
    render(<Bouton disabled onClick={surClic}>Inactif</Bouton>)
    fireEvent.click(screen.getByRole('button'))
    expect(surClic).not.toHaveBeenCalled()
  })

  it('prend la pleine largeur avec pleineLargeur', () => {
    render(<Bouton pleineLargeur>Plein</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('w-full')
  })

  it('affiche l\'icône gauche', () => {
    render(<Bouton iconGauche={<span data-testid="icon-g">→</span>}>Avec icône</Bouton>)
    expect(screen.getByTestId('icon-g')).toBeInTheDocument()
  })

  it('affiche le spinner en mode chargement', () => {
    render(<Bouton chargement>...</Bouton>)
    // Le loader est un SVG avec classe animate-spin
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applique la taille sm', () => {
    render(<Bouton taille="sm">Petit</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8')
  })

  it('applique la taille lg', () => {
    render(<Bouton taille="lg">Grand</Bouton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-12')
  })
})
