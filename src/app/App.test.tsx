import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import App from './App'

// Generic fetch mock: satisfies both .text() (HomePage, AdminPage) and .json() (TestList, AssignmentList)
const makeGenericFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    text: () =>
      Promise.resolve(
        JSON.stringify({
          files: [],
          counts: { exams: { approved: 0 }, assignments: { approved: 0 } },
        }),
      ),
    json: () => Promise.resolve({ status: 'success', data: [] }),
  })

beforeEach(() => {
  vi.stubGlobal('fetch', makeGenericFetch())
  vi.stubGlobal('alert', vi.fn())
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

const renderApp = (initialPath = '/') =>
  render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </LanguageProvider>,
  )

describe('App routing', () => {
  it('renders HomePage at /', () => {
    renderApp('/')
    // Both the Header and HomePage render h1 with the same title; check a HomePage-specific button
    expect(screen.getByRole('button', { name: '過去問を閲覧' })).toBeInTheDocument()
  })

  it('renders LoginPage at /login', () => {
    renderApp('/login')
    expect(screen.getByRole('heading', { name: '管理者ログイン' })).toBeInTheDocument()
  })

  it('renders TestList at /tests', async () => {
    renderApp('/tests')
    await waitFor(() => {
      expect(screen.getByText('0件の過去問が見つかりました')).toBeInTheDocument()
    })
  })

  it('renders TestForm at /tests/new', () => {
    renderApp('/tests/new')
    expect(screen.getByRole('heading', { name: '過去問を登録' })).toBeInTheDocument()
  })

  it('renders TestDetail at /tests/:id', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'success',
          data: {
            id: 'EX001',
            subject: 'Physics',
            area: '情報科学領域',
            term: '春学期',
            year: 2024,
            instructor: 'Prof. A',
            allowedMaterialsStr: '',
            created_at: '2024-04-01T00:00:00Z',
            pdf_url: '',
          },
        }),
    }))
    renderApp('/tests/EX001')
    await waitFor(() => {
      expect(screen.getAllByText(/Physics/).length).toBeGreaterThan(0)
    })
  })

  it('renders AssignmentList at /assignments', async () => {
    renderApp('/assignments')
    await waitFor(() => {
      expect(screen.getByText(/件の課題情報が見つかりました/)).toBeInTheDocument()
    })
  })

  it('renders AssignmentForm at /assignments/new', () => {
    renderApp('/assignments/new')
    expect(screen.getByRole('heading', { name: '課題を登録' })).toBeInTheDocument()
  })

  it('renders AssignmentDetail at /assignments/:id', async () => {
    vi.stubEnv('VITE_GAS_DISPLAY_ENDPOINT', 'https://test.example.com')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: {
          id: 'A001',
          subject: 'Advanced Algorithms',
          lecture_no: '3',
          area: 'Information',
          term: 'spring',
          year: 2024,
          file_url: '',
          created_at: '',
        },
      }),
    }))
    renderApp('/assignments/A001')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Advanced Algorithms (第3回)' }),
      ).toBeInTheDocument()
    })
  })

  it('renders AdminPage at /admin', async () => {
    renderApp('/admin')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '管理者ページ' })).toBeInTheDocument()
    })
  })

  it('redirects unknown paths to /', () => {
    renderApp('/unknown-path-xyz')
    expect(screen.getByRole('button', { name: '過去問を閲覧' })).toBeInTheDocument()
  })
})

describe('App Header visibility', () => {
  it('shows the Header on the home page', () => {
    renderApp('/')
    expect(screen.getByTitle('Switch to English')).toBeInTheDocument()
  })

  it('hides the Header on the login page', () => {
    renderApp('/login')
    expect(screen.queryByTitle('Switch to English')).not.toBeInTheDocument()
  })

  it('shows the Header on the test list page', async () => {
    renderApp('/tests')
    await waitFor(() => {
      expect(screen.getByTitle('Switch to English')).toBeInTheDocument()
    })
  })
})
