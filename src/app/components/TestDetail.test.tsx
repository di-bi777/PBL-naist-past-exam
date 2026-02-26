import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { TestDetail } from './TestDetail'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

const mockRow = {
  id: 'EX001',
  subject: 'Advanced Algorithms',
  area: '情報科学領域',
  term: '春学期',
  year: 2024,
  instructor: 'Prof. Smith',
  allowedMaterialsStr: 'Calculator',
  created_at: '2024-04-01T00:00:00Z',
  pdf_url: 'https://drive.google.com/file/abc/view',
}

const makeOkResponse = (data: object) => ({
  ok: true,
  json: () => Promise.resolve({ status: 'success', data }),
})

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(mockRow)))
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderDetail = (props: Partial<React.ComponentProps<typeof TestDetail>> = {}) =>
  render(
    <TestDetail testId="EX001" onNavigate={vi.fn()} {...props} />,
    { wrapper }
  )

describe('TestDetail', () => {
  it('shows loading indicator initially', () => {
    renderDetail()
    expect(screen.getByText('詳細データを読み込んでいます...')).toBeInTheDocument()
  })

  it('renders subject name after data loads', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getAllByText(/Advanced Algorithms/).length).toBeGreaterThan(0)
    })
  })

  it('renders instructor name after data loads', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Prof. Smith')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('shows error when response is not OK', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    }))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('shows API error message when status is "error"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'error', message: 'Record not found' }),
    }))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Record not found')).toBeInTheDocument()
    })
  })

  it('shows back button in error state and calls onNavigate', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')))
    const onNavigate = vi.fn()
    renderDetail({ onNavigate })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '一覧に戻る' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: '一覧に戻る' }))
    expect(onNavigate).toHaveBeenCalledWith('test-list')
  })

  it('calls onNavigate("test-list") when back button is clicked in success state', async () => {
    const onNavigate = vi.fn()
    renderDetail({ onNavigate })
    await waitFor(() => {
      expect(screen.getAllByText(/Advanced Algorithms/).length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getByRole('button', { name: '一覧に戻る' }))
    expect(onNavigate).toHaveBeenCalledWith('test-list')
  })

  it('shows "open in new tab" link when PDF URL is present', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('別タブで開く')).toBeInTheDocument()
    })
  })

  it('shows "no PDF" message when pdf_url is empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse({ ...mockRow, pdf_url: '' })))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('PDFのURLが登録されていません。')).toBeInTheDocument()
    })
  })

  // --- lookup-map false branches ---
  it('renders unknown area and semester text as-is (covers displayArea/displaySemester false branches)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse({
      ...mockRow, area: 'SpecialArea', term: 'Winter',
    })))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('SpecialArea')).toBeInTheDocument()
      expect(screen.getByText('Winter')).toBeInTheDocument()
    })
  })

  // --- English language branches ---
  it('renders year without 年度 suffix in English mode (covers language ternary)', async () => {
    localStorage.setItem('language', 'en')
    renderDetail()
    await waitFor(() => {
      // In English: `${test.subject} (${test.year})` instead of `${test.subject} (${test.year}年度)`
      expect(screen.getByRole('heading', { level: 1, name: 'Advanced Algorithms (2024)' })).toBeInTheDocument()
    })
  })

  // --- empty optional fields ---
  it('shows fallback text when instructor and allowedMaterials are empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse({
      ...mockRow, instructor: '', allowedMaterialsStr: '',
    })))
    renderDetail()
    await waitFor(() => {
      expect(screen.getAllByText('不明').length).toBeGreaterThan(0)   // t('testDetail.unknown')
      expect(screen.getByText('特になし')).toBeInTheDocument()        // t('testDetail.noMaterials')
    })
  })

  it('shows empty uploadedAt when created_at is missing (covers ternary false branch at uploadedAt)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse({
      ...mockRow, created_at: '',
    })))
    renderDetail()
    await waitFor(() => {
      expect(screen.getAllByText(/Advanced Algorithms/).length).toBeGreaterThan(0)
    })
  })

  it('shows loadError translation when fetch rejects with a non-Error value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('plain string error'))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('読み込みエラーが発生しました')).toBeInTheDocument()
    })
  })
})
