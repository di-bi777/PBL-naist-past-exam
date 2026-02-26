import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AssignmentList } from './AssignmentList'

// ---------------------------------------------------------------------------
// Fixtures — API response format expected by AssignmentList
// ---------------------------------------------------------------------------
// id=1  データ構造とアルゴリズム (第3回)  area=Information  semester=spring  year=2025
// id=2  有機化学実験 (第5回)              area=Biological   semester=fall    year=2024
// id=3  英語プレゼンテーション (第2回)    area=Information  semester=spring  year=2025
// id=4  物理学演習 (第4回)               area=Materials    semester=spring  year=2025
// id=5  経済学 (第1回)                   area=Biological   semester=fall    year=2024

const mockRows = [
  { id: '1', subject: 'データ構造とアルゴリズム', lecture_no: '3', area: 'Information', term: 'spring', year: 2025, type: 'approved', file_url: '', created_at: '' },
  { id: '2', subject: '有機化学実験', lecture_no: '5', area: 'Biological', term: 'fall', year: 2024, type: 'approved', file_url: '', created_at: '' },
  { id: '3', subject: '英語プレゼンテーション', lecture_no: '2', area: 'Information', term: 'spring', year: 2025, type: 'approved', file_url: '', created_at: '' },
  { id: '4', subject: '物理学演習', lecture_no: '4', area: 'Materials', term: 'spring', year: 2025, type: 'approved', file_url: '', created_at: '' },
  { id: '5', subject: '経済学', lecture_no: '1', area: 'Biological', term: 'fall', year: 2024, type: 'approved', file_url: '', created_at: '' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ status: 'success', data: mockRows }),
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderList = (onNavigate = vi.fn(), onShowForm = vi.fn()) =>
  render(<AssignmentList onNavigate={onNavigate} onShowForm={onShowForm} />, { wrapper })

// Wait for the list to finish loading and show all 5 results
const waitForList = () =>
  waitFor(() => expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument())

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AssignmentList', () => {
  // --- rendering ---
  it('renders the page title', async () => {
    renderList()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '課題情報' })).toBeInTheDocument()
    )
  })

  it('shows a back-to-home button', async () => {
    renderList()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /ホームに戻る/ })).toBeInTheDocument()
    )
  })

  it('shows a register-assignment button', async () => {
    renderList()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /課題を登録/ })).toBeInTheDocument()
    )
  })

  it('shows a search input with the correct placeholder', async () => {
    renderList()
    await waitFor(() =>
      expect(screen.getByPlaceholderText('科目名・タイトルで検索')).toBeInTheDocument()
    )
  })

  it('renders all 5 mock assignments on initial load', async () => {
    renderList()
    await waitForList()
  })

  it('renders each assignment card title', async () => {
    renderList()
    await waitForList()
    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズム/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /有機化学実験/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /物理学演習/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /経済学/ })).toBeInTheDocument()
  })

  // --- search filter ---
  it('filters assignments by title keyword', async () => {
    renderList()
    await waitForList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'アルゴリズム' },
    })

    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズム/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /有機化学実験/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /英語プレゼンテーション/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /物理学演習/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /経済学/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('filters assignments by subject keyword', async () => {
    renderList()
    await waitForList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '有機化学' },
    })

    expect(screen.getByRole('heading', { name: /有機化学実験/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /データ構造/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('shows 0 results for a non-matching search query', async () => {
    renderList()
    await waitForList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'QuantumMechanicsXYZ' },
    })

    expect(screen.getByText('0件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when search is cleared', async () => {
    renderList()
    await waitForList()
    const input = screen.getByPlaceholderText('科目名・タイトルで検索')
    fireEvent.change(input, { target: { value: 'アルゴリズム' } })
    fireEvent.change(input, { target: { value: '' } })

    expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- semester filter ---
  it('filters by spring semester (shows 3 items)', async () => {
    renderList()
    await waitForList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    // spring: IDs 1, 3, 4
    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズム/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /有機化学実験/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /物理学演習/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /経済学/ })).not.toBeInTheDocument()
    expect(screen.getByText('3件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('filters by fall semester (shows 2 items)', async () => {
    renderList()
    await waitForList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'fall' } })

    // fall: IDs 2, 5
    expect(screen.queryByRole('heading', { name: /データ構造とアルゴリズム/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /有機化学実験/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /英語プレゼンテーション/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /物理学演習/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /経済学/ })).toBeInTheDocument()
    expect(screen.getByText('2件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when semester is reset to "all"', async () => {
    renderList()
    await waitForList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })
    fireEvent.change(semesterSelect, { target: { value: 'all' } })

    expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- area filter ---
  it('area filter returns 2 results for Information area', async () => {
    renderList()
    await waitForList()
    const [areaSelect] = screen.getAllByRole('combobox')
    fireEvent.change(areaSelect, { target: { value: 'Information' } })

    // Information: IDs 1, 3
    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズム/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /有機化学実験/ })).not.toBeInTheDocument()
    expect(screen.getByText('2件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- combined filter ---
  it('applies search AND semester filters together', async () => {
    renderList()
    await waitForList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '英語' },
    })
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    // Only '英語プレゼンテーション' matches both
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション/ })).toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('returns 0 results when no items match combined search and semester', async () => {
    renderList()
    await waitForList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    // '有機化学実験' is fall; filtering spring should exclude it
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '有機化学' },
    })
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    expect(screen.getByText('0件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- navigation ---
  it('calls onNavigate("home") when back button is clicked', async () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /ホームに戻る/ })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /ホームに戻る/ }))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })

  it('calls onShowForm when register button is clicked', async () => {
    const onShowForm = vi.fn()
    renderList(vi.fn(), onShowForm)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /課題を登録/ })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: /課題を登録/ }))
    expect(onShowForm).toHaveBeenCalled()
  })

  it('calls onNavigate("assignment-detail", id) when a card is clicked', async () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)
    await waitForList()

    // Click the h3 — click event bubbles up to the parent div's onClick handler
    fireEvent.click(screen.getByRole('heading', { name: /データ構造とアルゴリズム/ }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-detail', '1')
  })
})
