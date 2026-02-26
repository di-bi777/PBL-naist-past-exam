import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AdminPage } from './AdminPage'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

const mockFiles = [
  {
    id: 'file001',
    name: 'exam_2024_cs.pdf',
    mimeType: 'application/pdf',
    size: 102400,
    modifiedTime: '2024-04-01T10:00:00Z',
    webViewLink: 'https://drive.google.com/file/file001/view',
  },
  {
    id: 'file002',
    name: 'assignment_spring.pdf',
    mimeType: 'application/pdf',
    size: 51200,
    modifiedTime: '2024-03-01T10:00:00Z',
    webViewLink: 'https://drive.google.com/file/file002/view',
  },
]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
  }))
  vi.stubGlobal('alert', vi.fn())
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderAdminPage = (props: Partial<React.ComponentProps<typeof AdminPage>> = {}) =>
  render(<AdminPage onBack={vi.fn()} {...props} />, { wrapper })

describe('AdminPage', () => {
  it('renders the admin page title', () => {
    renderAdminPage()
    expect(screen.getByRole('heading', { name: '管理者ページ' })).toBeInTheDocument()
  })

  it('renders the back to home button', () => {
    renderAdminPage()
    expect(screen.getByRole('button', { name: /ホームに戻る/ })).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    renderAdminPage({ onBack })
    fireEvent.click(screen.getByRole('button', { name: /ホームに戻る/ }))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows loading state while fetching', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderAdminPage()
    await waitFor(() => {
      expect(screen.getAllByText('取得中...').length).toBeGreaterThan(0)
    })
  })

  it('shows file names after data loads', async () => {
    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })
    expect(screen.getByText('assignment_spring.pdf')).toBeInTheDocument()
  })

  it('shows approve and reject buttons for each file', async () => {
    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('button', { name: '承認' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: '拒否' })).toHaveLength(2)
  })

  it('shows error state when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error'),
    }))
    renderAdminPage()
    await waitFor(() => {
      expect(
        screen.getAllByText('Google Drive の取得に失敗しました。権限設定やフォルダ共有設定を確認してください。').length
      ).toBeGreaterThan(0)
    })
  })

  it('removes a file from the list after successful approval', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: '承認' })
    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('exam_2024_cs.pdf')).not.toBeInTheDocument()
    })
  })

  it('does not remove the file when the user cancels the confirm dialog', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: '承認' })
    fireEvent.click(approveButtons[0])

    expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
  })

  it('shows an alert when approval fetch returns a non-ok response', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ message: 'Token invalid' })),
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '承認' })[0])

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('承認に失敗しました'))
    })
  })

  it('removes file from list after successful rejection', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '拒否' })[0])

    await waitFor(() => {
      expect(screen.queryByText('exam_2024_cs.pdf')).not.toBeInTheDocument()
    })
  })

  it('shows an alert when rejection fetch fails', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(JSON.stringify({ message: 'Permission denied' })),
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '拒否' })[0])

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('拒否に失敗しました'))
    })
  })

  it('rejection succeeds without admin token in sessionStorage (token guard removed)', async () => {
    // No sessionStorage.setItem('admin_api_token', ...) — token is no longer required
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '拒否' })[0])

    await waitFor(() => {
      expect(screen.queryByText('exam_2024_cs.pdf')).not.toBeInTheDocument()
    })
  })

  it('removes file when rejection returns non-JSON ok response (covers JSON.parse catch in handleReject)', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('OK'), // non-JSON but ok → result = null → succeeded
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '拒否' })[0])

    await waitFor(() => {
      expect(screen.queryByText('exam_2024_cs.pdf')).not.toBeInTheDocument()
    })
  })

  it('removes file from list when approval returns non-JSON ok response (covers JSON.parse catch in handleApprove)', async () => {
    sessionStorage.setItem('admin_api_token', 'test-token')
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ files: mockFiles })),
      })
      .mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('OK'), // non-JSON but ok → result = null → approve succeeds
      })
    vi.stubGlobal('fetch', fetchMock)

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('exam_2024_cs.pdf')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: '承認' })[0])

    await waitFor(() => {
      expect(screen.queryByText('exam_2024_cs.pdf')).not.toBeInTheDocument()
    })
  })

  it('shows "no link" button when file has no webViewLink', async () => {
    const filesWithoutLink = [{
      id: 'file003',
      name: 'no_link.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      modifiedTime: '2024-01-01T00:00:00Z',
    }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ files: filesWithoutLink })),
    }))

    renderAdminPage()
    await waitFor(() => {
      expect(screen.getByText('no_link.pdf')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'リンクなし' })).toBeInTheDocument()
  })
})
