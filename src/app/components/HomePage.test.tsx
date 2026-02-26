import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { HomePage } from './HomePage'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

const successPayload = {
  counts: {
    exams: { approved: 42 },
    assignments: { approved: 15 },
  },
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(successPayload)),
  }))
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderHomePage = (props: Partial<React.ComponentProps<typeof HomePage>> = {}) =>
  render(
    <HomePage
      onNavigate={vi.fn()}
      onAdminLogin={vi.fn()}
      isLoggedIn={false}
      {...props}
    />,
    { wrapper }
  )

describe('HomePage', () => {
  it('renders the page title', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { level: 1, name: '過去問共有プラットフォーム' })).toBeInTheDocument()
  })

  it('renders all four navigation buttons', () => {
    renderHomePage()
    expect(screen.getByRole('button', { name: '過去問を閲覧' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /過去問を登録/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '課題を閲覧' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /課題を登録/ })).toBeInTheDocument()
  })

  it('calls onNavigate("test-list") when browse exams is clicked', () => {
    const onNavigate = vi.fn()
    renderHomePage({ onNavigate })
    fireEvent.click(screen.getByRole('button', { name: '過去問を閲覧' }))
    expect(onNavigate).toHaveBeenCalledWith('test-list')
  })

  it('calls onNavigate("test-form") when register exam is clicked', () => {
    const onNavigate = vi.fn()
    renderHomePage({ onNavigate })
    fireEvent.click(screen.getByRole('button', { name: /過去問を登録/ }))
    expect(onNavigate).toHaveBeenCalledWith('test-form')
  })

  it('calls onNavigate("assignment-list") when browse assignments is clicked', () => {
    const onNavigate = vi.fn()
    renderHomePage({ onNavigate })
    fireEvent.click(screen.getByRole('button', { name: '課題を閲覧' }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-list')
  })

  it('calls onNavigate("assignment-form") when register assignment is clicked', () => {
    const onNavigate = vi.fn()
    renderHomePage({ onNavigate })
    fireEvent.click(screen.getByRole('button', { name: /課題を登録/ }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-form')
  })

  it('shows "..." while stats are loading', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderHomePage()
    await waitFor(() => expect(screen.getAllByText('...')).toHaveLength(2))
  })

  it('shows approved counts after data loads', async () => {
    renderHomePage()
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  it('shows "—" for both stats when the API returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error'),
    }))
    renderHomePage()
    await waitFor(() => {
      expect(screen.getAllByText('—')).toHaveLength(2)
    })
  })

  it('shows admin login button when not logged in', () => {
    renderHomePage({ isLoggedIn: false })
    expect(screen.getByRole('button', { name: '管理者ログイン' })).toBeInTheDocument()
  })

  it('hides admin login button when logged in', () => {
    renderHomePage({ isLoggedIn: true })
    expect(screen.queryByRole('button', { name: '管理者ログイン' })).not.toBeInTheDocument()
  })

  it('calls onAdminLogin when admin login button is clicked', () => {
    const onAdminLogin = vi.fn()
    renderHomePage({ onAdminLogin, isLoggedIn: false })
    fireEvent.click(screen.getByRole('button', { name: '管理者ログイン' }))
    expect(onAdminLogin).toHaveBeenCalled()
  })

  it('shows "—" when the API response does not contain counts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'ok' })),
    }))
    renderHomePage()
    await waitFor(() => {
      expect(screen.getAllByText('—')).toHaveLength(2)
    })
  })

  it('does not show error state when fetch throws an AbortError (covers AbortError early-return branch)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new DOMException('The user aborted a request.', 'AbortError'),
    ))
    renderHomePage()
    // Wait for the async effect to complete — AbortError returns early without setStatsStatus('error')
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.queryByText('—')).not.toBeInTheDocument()
  })
})
