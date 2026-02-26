import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { Header } from './Header'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  localStorage.clear()
})

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header isLoggedIn={false} />, { wrapper })
    expect(screen.getByRole('heading', { level: 1, name: '過去問共有プラットフォーム' })).toBeInTheDocument()
  })

  it('shows JP language toggle by default', () => {
    render(<Header isLoggedIn={false} />, { wrapper })
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('switches to EN after clicking the language toggle', () => {
    render(<Header isLoggedIn={false} />, { wrapper })
    fireEvent.click(screen.getByTitle('Switch to English'))
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.queryByText('JP')).not.toBeInTheDocument()
  })

  it('does not show logout button when logged out', () => {
    render(<Header isLoggedIn={false} />, { wrapper })
    expect(screen.queryByText('ログアウト')).not.toBeInTheDocument()
  })

  it('shows logout button when logged in', () => {
    render(<Header isLoggedIn={true} username="testuser" onLogout={vi.fn()} />, { wrapper })
    expect(screen.getByRole('button', { name: /ログアウト/ })).toBeInTheDocument()
  })

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = vi.fn()
    render(<Header isLoggedIn={true} username="testuser" onLogout={onLogout} />, { wrapper })
    fireEvent.click(screen.getByRole('button', { name: /ログアウト/ }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('shows username in the user button when logged in', () => {
    render(<Header isLoggedIn={true} username="testuser" />, { wrapper })
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('shows translated admin label when username is "admin"', () => {
    render(<Header isLoggedIn={true} username="admin" />, { wrapper })
    expect(screen.getByText('管理者')).toBeInTheDocument()
    expect(screen.queryByText('admin')).not.toBeInTheDocument()
  })

  it('calls onAdminNavigate when the user button is clicked', () => {
    const onAdminNavigate = vi.fn()
    render(<Header isLoggedIn={true} username="testuser" onAdminNavigate={onAdminNavigate} />, { wrapper })
    fireEvent.click(screen.getByText('testuser').closest('button')!)
    expect(onAdminNavigate).toHaveBeenCalled()
  })

  it('switches back to JP after clicking the language toggle when already in English mode', () => {
    localStorage.setItem('language', 'en')
    render(<Header isLoggedIn={false} />, { wrapper })
    expect(screen.getByText('EN')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle('日本語に切り替え'))
    expect(screen.getByText('JP')).toBeInTheDocument()
  })
})
