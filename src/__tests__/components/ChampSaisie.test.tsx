import { render, screen, fireEvent } from '@testing-library/react'
import ChampSaisie from '@/components/ui/ChampSaisie'

describe('ChampSaisie', () => {
  it('affiche le libellé', () => {
    render(<ChampSaisie libelle="Nom" />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
  })

  it('affiche l\'astérisque pour un champ requis', () => {
    render(<ChampSaisie libelle="Email" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('affiche le message d\'erreur', () => {
    render(<ChampSaisie libelle="Email" erreur="Email invalide" />)
    expect(screen.getByText('Email invalide')).toBeInTheDocument()
  })

  it('n\'affiche pas le message d\'erreur si absent', () => {
    render(<ChampSaisie libelle="Email" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('affiche la description', () => {
    render(<ChampSaisie libelle="Mot de passe" description="Au moins 8 caractères" />)
    expect(screen.getByText('Au moins 8 caractères')).toBeInTheDocument()
  })

  it('ne montre pas la description si une erreur est présente', () => {
    render(
      <ChampSaisie
        libelle="Mot de passe"
        description="Au moins 8 caractères"
        erreur="Trop court"
      />
    )
    expect(screen.queryByText('Au moins 8 caractères')).not.toBeInTheDocument()
    expect(screen.getByText('Trop court')).toBeInTheDocument()
  })

  it('est désactivé quand disabled est true', () => {
    render(<ChampSaisie libelle="Champ" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('appelle onChange à la saisie', () => {
    const surChangement = jest.fn()
    render(<ChampSaisie libelle="Test" onChange={surChangement} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bonjour' } })
    expect(surChangement).toHaveBeenCalledTimes(1)
  })

  it('associe le label à l\'input via l\'id', () => {
    render(<ChampSaisie libelle="Prénom" id="prenom" />)
    const label = screen.getByText('Prénom').closest('label')
    expect(label?.htmlFor).toBe('prenom')
  })
})
