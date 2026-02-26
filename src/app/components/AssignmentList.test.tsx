import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentList } from './AssignmentList'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
// 5 static mock items defined inside AssignmentList.tsx:
//   id=1  データ構造とアルゴリズムのレポート課題  area=cs   semester=spring  year=2025
//   id=2  有機化学実験レポート                    area=bio  semester=fall    year=2024
//   id=3  英語プレゼンテーション課題              area=cs   semester=spring  year=2025
//   id=4  物理学演習問題集                        area=mat  semester=spring  year=2025
//   id=5  経済学レポート：市場分析                area=bio  semester=fall    year=2024
//
// NOTE: The area filter is broken by design — mock data uses 'cs'/'bio'/'mat'
// but the dropdown options use 'Information'/'Biological'/'Materials'.
// Selecting a specific area always yields 0 results (documented in tests below).

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderList = (onNavigate = vi.fn(), onShowForm = vi.fn()) =>
  render(<AssignmentList onNavigate={onNavigate} onShowForm={onShowForm} />)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AssignmentList', () => {
  // --- rendering ---
  it('renders the page title', () => {
    renderList()
    expect(screen.getByRole('heading', { name: '課題情報' })).toBeInTheDocument()
  })

  it('shows a back-to-home button', () => {
    renderList()
    expect(screen.getByRole('button', { name: /ホームに戻る/ })).toBeInTheDocument()
  })

  it('shows a register-assignment button', () => {
    renderList()
    expect(screen.getByRole('button', { name: /課題を登録/ })).toBeInTheDocument()
  })

  it('shows a search input with the correct placeholder', () => {
    renderList()
    expect(screen.getByPlaceholderText('科目名・タイトルで検索')).toBeInTheDocument()
  })

  it('renders all 5 mock assignments on initial load', () => {
    renderList()
    expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('renders each assignment card title', () => {
    renderList()
    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /有機化学実験レポート/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション課題/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /物理学演習問題集/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /経済学レポート/ })).toBeInTheDocument()
  })

  // --- search filter ---
  it('filters assignments by title keyword', () => {
    renderList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'アルゴリズム' },
    })

    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /有機化学実験レポート/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /英語プレゼンテーション課題/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /物理学演習問題集/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /経済学レポート/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('filters assignments by subject keyword', () => {
    renderList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '有機化学' },
    })

    expect(screen.getByRole('heading', { name: /有機化学実験レポート/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /データ構造/ })).not.toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('shows 0 results for a non-matching search query', () => {
    renderList()
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: 'QuantumMechanicsXYZ' },
    })

    expect(screen.getByText('0件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when search is cleared', () => {
    renderList()
    const input = screen.getByPlaceholderText('科目名・タイトルで検索')
    fireEvent.change(input, { target: { value: 'アルゴリズム' } })
    fireEvent.change(input, { target: { value: '' } })

    expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- semester filter ---
  it('filters by spring semester (shows 3 items)', () => {
    renderList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    // spring: IDs 1, 3, 4
    expect(screen.getByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /有機化学実験レポート/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション課題/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /物理学演習問題集/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /経済学レポート/ })).not.toBeInTheDocument()
    expect(screen.getByText('3件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('filters by fall semester (shows 2 items)', () => {
    renderList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'fall' } })

    // fall: IDs 2, 5
    expect(screen.queryByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /有機化学実験レポート/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /英語プレゼンテーション課題/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /物理学演習問題集/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /経済学レポート/ })).toBeInTheDocument()
    expect(screen.getByText('2件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('restores all results when semester is reset to "all"', () => {
    renderList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })
    fireEvent.change(semesterSelect, { target: { value: 'all' } })

    expect(screen.getByText('5件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- area filter (known mismatch bug) ---
  // The mock data uses area keys 'cs'/'bio'/'mat' but the dropdown options use
  // 'Information'/'Biological'/'Materials'. Since the filter compares
  // assignment.area === selectedArea, selecting any specific area yields 0 results.
  it('area filter returns 0 results for any specific area (data/option key mismatch)', () => {
    renderList()
    const [areaSelect] = screen.getAllByRole('combobox')
    fireEvent.change(areaSelect, { target: { value: 'Information' } })

    expect(screen.getByText('0件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- combined filter ---
  it('applies search AND semester filters together', () => {
    renderList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '英語' },
    })
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    // Only '英語プレゼンテーション課題' matches both
    expect(screen.getByRole('heading', { name: /英語プレゼンテーション課題/ })).toBeInTheDocument()
    expect(screen.getByText('1件の課題情報が見つかりました')).toBeInTheDocument()
  })

  it('returns 0 results when no items match combined search and semester', () => {
    renderList()
    const [, semesterSelect] = screen.getAllByRole('combobox')
    // '有機化学実験レポート' is fall; filtering spring should exclude it
    fireEvent.change(screen.getByPlaceholderText('科目名・タイトルで検索'), {
      target: { value: '有機化学' },
    })
    fireEvent.change(semesterSelect, { target: { value: 'spring' } })

    expect(screen.getByText('0件の課題情報が見つかりました')).toBeInTheDocument()
  })

  // --- navigation ---
  it('calls onNavigate("home") when back button is clicked', () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)

    fireEvent.click(screen.getByRole('button', { name: /ホームに戻る/ }))
    expect(onNavigate).toHaveBeenCalledWith('home')
  })

  it('calls onShowForm when register button is clicked', () => {
    const onShowForm = vi.fn()
    renderList(vi.fn(), onShowForm)

    fireEvent.click(screen.getByRole('button', { name: /課題を登録/ }))
    expect(onShowForm).toHaveBeenCalled()
  })

  it('calls onNavigate("assignment-detail", id) when a card is clicked', () => {
    const onNavigate = vi.fn()
    renderList(onNavigate)

    // Click the h3 — click event bubbles up to the parent div's onClick handler
    fireEvent.click(screen.getByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-detail', '1')
  })
})
