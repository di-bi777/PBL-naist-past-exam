import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { TestList } from './TestList'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * Three-item dataset that exercises every filter dimension:
 *   area:     EX001=情報科学領域  EX002=バイオサイエンス領域  EX003=情報科学領域
 *   semester: EX001=春学期        EX002=秋学期               EX003=秋学期
 */
const rawItems = [
  {
    id: 'EX001',
    subject: 'Physics',
    area: '情報科学領域',
    term: '春学期',
    year: 2024,
    instructor: 'Prof. A',
    created_at: '2024-04-01T00:00:00Z',
    pdf_url: 'https://drive.google.com/file/abc',
    type: 'final',
  },
  {
    id: 'EX002',
    subject: 'Chemistry',
    area: 'バイオサイエンス領域',
    term: '秋学期',
    year: 2023,
    instructor: 'Prof. B',
    created_at: '2023-10-01T00:00:00Z',
    pdf_url: 'https://drive.google.com/file/def',
    type: 'midterm',
  },
  {
    id: 'EX003',
    subject: 'Mathematics',
    area: '情報科学領域',
    term: '秋学期',
    year: 2024,
    instructor: 'Prof. C',
    created_at: '2024-10-01T00:00:00Z',
    pdf_url: 'https://drive.google.com/file/ghi',
    type: 'final',
  },
]

const successResponse = { status: 'success', data: rawItems }

// ---------------------------------------------------------------------------
// Setup / helpers
// ---------------------------------------------------------------------------

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(successResponse),
  }))
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderList = (onNavigate = vi.fn(), onShowForm = vi.fn()) =>
  render(<TestList onNavigate={onNavigate} onShowForm={onShowForm} />, { wrapper })

/** Wait until the loading spinner disappears. */
const waitForLoad = () =>
  waitFor(() =>
    expect(screen.queryByText('データを読み込んでいます...')).not.toBeInTheDocument(),
  )

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('TestList', () => {
  // --- loading state ---
  it('shows loading indicator on mount', () => {
    renderList()
    expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument()
  })

  // --- data rendering ---
  it('renders one card per exam after data loads', async () => {
    renderList()
    await waitForLoad()
    expect(screen.getByRole('heading', { name: /Physics/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Chemistry/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Mathematics/ })).toBeInTheDocument()
  })

  it('shows correct result count after data loads', async () => {
    renderList()
    await waitForLoad()
    expect(screen.getByText('3件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('shows instructor name on the card', async () => {
    renderList()
    await waitForLoad()
    expect(screen.getByText(/Prof\. A/)).toBeInTheDocument()
  })

  // --- error states ---
  it('shows HTTP error when fetch returns non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText(/HTTP error!/)).toBeInTheDocument()
    })
  })

  it('shows API error message from response body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'error', message: 'DB connection failed' }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('DB connection failed')).toBeInTheDocument()
    })
  })

  it('shows reload button when there is an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    renderList()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /再読み込み/ })).toBeInTheDocument()
    })
  })

  it('calls window.location.reload when reload button is clicked', async () => {
    const reloadSpy = vi.fn()
    vi.stubGlobal('location', { reload: reloadSpy })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    renderList()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /再読み込み/ })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /再読み込み/ }))
    expect(reloadSpy).toHaveBeenCalled()
  })

  // --- search filter ---
  it('filters cards by subject text (case-insensitive)', async () => {
    renderList()
    await waitForLoad()

    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'phys' },
    })

    expect(screen.getByRole('heading', { name: /Physics/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Chemistry/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Mathematics/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('filters cards by year embedded in the title', async () => {
    renderList()
    await waitForLoad()

    // title = "Chemistry (2023)" — searching "2023" matches only Chemistry
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '2023' },
    })

    expect(screen.queryByRole('heading', { name: /Physics/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Chemistry/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Mathematics/ })).not.toBeInTheDocument()
  })

  it('shows 0 results for a non-matching search query', async () => {
    renderList()
    await waitForLoad()

    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'QuantumMechanicsXYZ' },
    })

    expect(screen.getByText('0件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when the search query is cleared', async () => {
    renderList()
    await waitForLoad()

    const input = screen.getByPlaceholderText('科目名・タイトルで検索')
    fireEvent.change(input, { target: { value: 'Physics' } })
    fireEvent.change(input, { target: { value: '' } })

    expect(screen.getByText('3件の過去問が見つかりました')).toBeInTheDocument()
  })

  // --- area filter ---
  it('filters cards by area', async () => {
    renderList()
    await waitForLoad()

    // The area select is the first <select> element
    const [areaSelect] = screen.getAllByRole('combobox')
    fireEvent.change(areaSelect, { target: { value: 'バイオサイエンス領域' } })

    expect(screen.queryByRole('heading', { name: /Physics/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Chemistry/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Mathematics/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when area is reset to "all"', async () => {
    renderList()
    await waitForLoad()

    const [areaSelect] = screen.getAllByRole('combobox')
    fireEvent.change(areaSelect, { target: { value: 'バイオサイエンス領域' } })
    fireEvent.change(areaSelect, { target: { value: 'all' } })

    expect(screen.getByText('3件の過去問が見つかりました')).toBeInTheDocument()
  })

  // --- semester filter ---
  it('filters cards by spring semester', async () => {
    renderList()
    await waitForLoad()

    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: '春学期' } })

    expect(screen.getByRole('heading', { name: /Physics/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Chemistry/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Mathematics/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('filters cards by fall semester', async () => {
    renderList()
    await waitForLoad()

    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: '秋学期' } })

    expect(screen.queryByRole('heading', { name: /Physics/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Chemistry/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Mathematics/ })).toBeInTheDocument()
    expect(screen.getByText('2件の過去問が見つかりました')).toBeInTheDocument()
  })

  // --- combined filters ---
  it('applies area AND semester filters together', async () => {
    renderList()
    await waitForLoad()

    const [areaSelect, semesterSelect] = screen.getAllByRole('combobox')
    // 情報科学領域 + 秋学期 → only Mathematics (EX003)
    fireEvent.change(areaSelect, { target: { value: '情報科学領域' } })
    fireEvent.change(semesterSelect, { target: { value: '秋学期' } })

    expect(screen.queryByRole('heading', { name: /Physics/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Chemistry/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Mathematics/ })).toBeInTheDocument()
    expect(screen.getByText('1件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('applies search text AND area AND semester filters together', async () => {
    renderList()
    await waitForLoad()

    const [areaSelect, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'Math' },
    })
    fireEvent.change(areaSelect, { target: { value: '情報科学領域' } })
    fireEvent.change(semesterSelect, { target: { value: '秋学期' } })

    expect(screen.getByRole('heading', { name: /Mathematics/ })).toBeInTheDocument()
    expect(screen.getByText('1件の過去問が見つかりました')).toBeInTheDocument()
  })

  it('returns 0 results when filters match no data', async () => {
    renderList()
    await waitForLoad()

    const [areaSelect, semesterSelect] = screen.getAllByRole('combobox')
    // 春学期 + バイオサイエンス領域 → no entries in fixture
    fireEvent.change(areaSelect, { target: { value: 'バイオサイエンス領域' } })
    fireEvent.change(semesterSelect, { target: { value: '春学期' } })

    expect(screen.getByText('0件の過去問が見つかりました')).toBeInTheDocument()
  })

  // --- navigation ---
  it('calls onNavigate("home") when back button is clicked', async () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)
    await waitForLoad()

    fireEvent.click(screen.getByRole('button', { name: /ホームに戻る/ }))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })

  it('calls onShowForm when the register button is clicked', async () => {
    const onShowForm = vi.fn()
    renderList(vi.fn(), onShowForm)
    await waitForLoad()

    fireEvent.click(screen.getByRole('button', { name: /過去問を登録/ }))
    expect(onShowForm).toHaveBeenCalled()
  })

  it('calls onNavigate("test-detail", id) when a card is clicked', async () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)
    await waitForLoad()

    // The card title rendered in Japanese is "{subject} ({year}年度)"
    fireEvent.click(screen.getByText('Physics (2024年度)'))
    expect(onNavigate).toHaveBeenCalledWith('test-detail', 'EX001')
  })

  // --- lookup-map false branches ---
  it('renders unknown area text as-is when area is not in the translation lookup map', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: [{ ...rawItems[0], id: 'EX099', area: 'SpecialArea' }],
      }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('SpecialArea')).toBeInTheDocument()
    })
  })

  it('renders unknown semester text as-is when semester is not in the translation lookup map', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: [{ ...rawItems[0], id: 'EX099', term: 'Summer' }],
      }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('Summer')).toBeInTheDocument()
    })
  })

  // --- English language mode ---
  it('shows English exam count text when language is set to English', async () => {
    localStorage.setItem('language', 'en')
    renderList()
    await waitFor(() => {
      expect(screen.getByText(/exam\(s\) found/)).toBeInTheDocument()
    })
  })

  // --- missing field fallbacks ---
  it('handles items with no instructor, date, or pdf URL (covers || and ternary false branches)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: [{ id: 'EX100', subject: 'Organic Chemistry', area: '情報科学領域', term: '春学期', year: 2020 }],
      }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Organic Chemistry/ })).toBeInTheDocument()
      // uploadedBy = '' → t('testList.unknown') shown
      expect(screen.getByText(/不明/)).toBeInTheDocument()
    })
  })

  it('shows error when json.error field is set (covers json.error branch)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'DB unavailable' }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('DB unavailable')).toBeInTheDocument()
    })
  })

  it('shows fetchError translation when fetch rejects with a non-Error value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('connection refused'))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('過去問データの読み込みに失敗しました。')).toBeInTheDocument()
    })
  })

  it('shows default error message when response has status:error but no message or error field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'error' }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('renders empty list when response data field is missing (covers json.data || [] branch)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'success' }),
    }))
    renderList()
    await waitFor(() => {
      expect(screen.getByText('0件の過去問が見つかりました')).toBeInTheDocument()
    })
  })
})
