import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentDetail } from './AssignmentDetail'

// AssignmentDetail uses hardcoded mock data; no LanguageProvider needed.

const renderDetail = (props: Partial<React.ComponentProps<typeof AssignmentDetail>> = {}) =>
  render(<AssignmentDetail assignmentId="A001" onNavigate={vi.fn()} {...props} />)

describe('AssignmentDetail', () => {
  it('renders the assignment title', () => {
    renderDetail()
    expect(
      screen.getByRole('heading', { level: 1, name: 'データ構造とアルゴリズムのレポート課題' })
    ).toBeInTheDocument()
  })

  it('shows the subject name', () => {
    renderDetail()
    expect(screen.getByText('データ構造とアルゴリズム')).toBeInTheDocument()
  })

  it('shows the professor name', () => {
    renderDetail()
    expect(screen.getByText('佐藤教授')).toBeInTheDocument()
  })

  it('shows the description section', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: '概要' })).toBeInTheDocument()
    expect(screen.getByText(/データ構造とアルゴリズムに関するレポート課題です。/)).toBeInTheDocument()
  })

  it('shows the tips section', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: 'ヒントとアドバイス' })).toBeInTheDocument()
    expect(screen.getByText(/過去の受講生からのアドバイス/)).toBeInTheDocument()
  })

  it('shows the detailed assignment content', () => {
    renderDetail()
    expect(screen.getByRole('heading', { name: '課題詳細' })).toBeInTheDocument()
  })

  it('shows uploader information', () => {
    renderDetail()
    expect(screen.getByText(/山田太郎/)).toBeInTheDocument()
  })

  it('calls onNavigate("assignment-list") when back button is clicked', () => {
    const onNavigate = vi.fn()
    renderDetail({ onNavigate })
    fireEvent.click(screen.getByRole('button', { name: /一覧に戻る/ }))
    expect(onNavigate).toHaveBeenCalledWith('assignment-list')
  })
})
