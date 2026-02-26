import { render, screen, fireEvent } from '@testing-library/react'
import { TermsOfService } from './TermsOfService'

const renderTerms = (onClose = vi.fn()) =>
  render(<TermsOfService onClose={onClose} />)

describe('TermsOfService', () => {
  it('renders the terms of service heading', () => {
    renderTerms()
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument()
  })

  it('renders the first article heading', () => {
    renderTerms()
    expect(screen.getByText(/第1条/)).toBeInTheDocument()
  })

  it('renders a close button', () => {
    renderTerms()
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderTerms(onClose)
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalled()
  })
})
