import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AssignmentDetail } from './AssignmentDetail'

// ---------------------------------------------------------------------------
// Mock data — API response format expected by AssignmentDetail
// ---------------------------------------------------------------------------
const mockRow = {
  id: 'A001',
  subject: 'Advanced Algorithms',
  lecture_no: '3',
  area: 'Information',
  term: 'spring',
  year: 2024,
  file_url: 'https://drive.google.com/file/abc/view',
  created_at: '2024-04-01T00:00:00Z',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  vi.stubEnv('VITE_GAS_DISPLAY_ENDPOINT', 'https://test.example.com')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ status: 'success', data: mockRow }),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const renderDetail = (props: Partial<React.ComponentProps<typeof AssignmentDetail>> = {}) =>
  render(<AssignmentDetail assignmentId="A001" onNavigate={vi.fn()} {...props} />, { wrapper })

// Wait for the detail page to finish loading
const waitForDetail = () =>
  waitFor(() =>
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  )

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AssignmentDetail', () => {
  it('renders the assignment title', async () => {
    renderDetail()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Advanced Algorithms (第3回)' })
      ).toBeInTheDocument()
    )
  })

  it('shows the subject name', async () => {
    renderDetail()
    await waitForDetail()
    // The subject label and value are rendered in the same section
    expect(screen.getByText('Advanced Algorithms')).toBeInTheDocument()
  })

  it('shows the professor name', async () => {
    renderDetail()
    await waitForDetail()
    // uploadedBy is set to t('assignmentDetail.unknown') = '不明'
    expect(screen.getByText(/不明/)).toBeInTheDocument()
  })

  it('shows the file preview section heading', async () => {
    renderDetail()
    await waitForDetail()
    expect(screen.getByRole('heading', { name: '課題ファイル' })).toBeInTheDocument()
  })

  it('shows the open-in-new-tab link when file url exists', async () => {
    renderDetail()
    await waitForDetail()
    expect(screen.getByRole('link', { name: /別タブで開く/ })).toBeInTheDocument()
  })

  it('shows no file message when file url is empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: { ...mockRow, file_url: '' },
      }),
    }))
    renderDetail()
    await waitFor(() =>
      expect(screen.getByText('ファイルのURLが登録されていません。')).toBeInTheDocument()
    )
    expect(screen.queryByRole('link', { name: /別タブで開く/ })).not.toBeInTheDocument()
  })

  it('shows uploader information', async () => {
    renderDetail()
    await waitForDetail()
    expect(screen.getByText(/登録者:/)).toBeInTheDocument()
  })

  it('calls onNavigate("assignment-list") when back button is clicked', async () => {
    const onNavigate = vi.fn()
    renderDetail({ onNavigate })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /一覧に戻る/ })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /一覧に戻る/ }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-list')
  })
})
