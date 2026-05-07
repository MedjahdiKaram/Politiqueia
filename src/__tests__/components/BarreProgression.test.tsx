import { render, screen } from '@testing-library/react'
import BarreProgression from '@/components/ui/BarreProgression'

describe('BarreProgression', () => {
  it('affiche la barre avec la bonne largeur', () => {
    const { container } = render(<BarreProgression valeur={50} max={100} />)
    const barre = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(barre.style.width).toBe('50%')
  })

  it('plafonne à 100%', () => {
    const { container } = render(<BarreProgression valeur={150} max={100} />)
    const barre = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(barre.style.width).toBe('100%')
  })

  it('ne descend pas en dessous de 0%', () => {
    const { container } = render(<BarreProgression valeur={-10} max={100} />)
    const barre = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(barre.style.width).toBe('0%')
  })

  it('affiche le libellé si fourni', () => {
    render(<BarreProgression valeur={30} max={100} libelle="Progression" />)
    expect(screen.getByText('Progression')).toBeInTheDocument()
  })

  it('affiche le pourcentage si demandé', () => {
    render(<BarreProgression valeur={75} max={100} afficherPourcentage />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('calcule le pourcentage correctement pour un max différent', () => {
    const { container } = render(<BarreProgression valeur={10} max={40} />)
    const barre = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(barre.style.width).toBe('25%')
  })

  it('applique aria-valuenow correctement', () => {
    const { container } = render(<BarreProgression valeur={60} max={100} />)
    const barre = container.querySelector('[role="progressbar"]') as HTMLElement
    expect(barre.getAttribute('aria-valuenow')).toBe('60')
  })
})
