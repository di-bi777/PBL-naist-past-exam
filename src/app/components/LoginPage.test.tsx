import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { LoginPage } from './LoginPage'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  localStorage.clear()
})

const renderLogin = (props: Partial<React.ComponentProps<typeof LoginPage>> = {}) =>
  render(
    <LoginPage onLogin={vi.fn()} onBack={vi.fn()} {...props} />,
    { wrapper }
  )

describe('LoginPage', () => {
  it('renders the admin login heading', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: '管理者ログイン' })).toBeInTheDocument()
  })

  it('renders username and password input fields', () => {
    renderLogin()
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
  })

  it('submit button is disabled when both fields are empty', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: '管理者ログイン' })).toBeDisabled()
  })

  it('submit button is disabled when only username is filled', () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'admin' } })
    expect(screen.getByRole('button', { name: '管理者ログイン' })).toBeDisabled()
  })

  it('submit button is disabled when only password is filled', () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'pass' } })
    expect(screen.getByRole('button', { name: '管理者ログイン' })).toBeDisabled()
  })

  it('submit button is enabled when both fields are filled', () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } })
    expect(screen.getByRole('button', { name: '管理者ログイン' })).toBeEnabled()
  })

  it('calls onLogin with the entered username', () => {
    const onLogin = vi.fn()
    renderLogin({ onLogin })
    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: '管理者ログイン' }))
    expect(onLogin).toHaveBeenCalledWith('admin')
  })

  it('does not call onLogin when fields are empty', () => {
    const onLogin = vi.fn()
    renderLogin({ onLogin })
    fireEvent.submit(document.querySelector('form')!)
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn()
    renderLogin({ onBack })
    fireEvent.click(screen.getByRole('button', { name: '戻る' }))
    expect(onBack).toHaveBeenCalled()
  })
})
