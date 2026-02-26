import { test, expect } from '@playwright/test'

// The app uses basename="/PBL-naist-past-exam/" in BrowserRouter
const BASE = '/PBL-naist-past-exam'

// ---------------------------------------------------------------------------
// Mock GAS API data
// ---------------------------------------------------------------------------
const MOCK_EXAMS = [
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
]

const mockGasApi = async (page: import('@playwright/test').Page, data = MOCK_EXAMS) => {
  await page.route('**/script.google.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data }),
    }),
  )
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
test.describe('Home page', () => {
  test('shows the home page subtitle', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page.getByText('みんなで作る、試験対策の知識ベース')).toBeVisible()
  })

  test('shows the past-exam section heading', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page.getByRole('heading', { name: 'テスト（過去問）' })).toBeVisible()
  })

  test('shows the assignment section heading', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page.getByRole('heading', { name: '課題' })).toBeVisible()
  })

  test('shows browse buttons for both sections', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page.getByRole('button', { name: '過去問を閲覧' })).toBeVisible()
    await expect(page.getByRole('button', { name: '課題を閲覧' })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// TestList page (/tests)
// ---------------------------------------------------------------------------
test.describe('TestList page', () => {
  test.beforeEach(async ({ page }) => {
    await mockGasApi(page)
  })

  test('renders exam cards after API response', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await expect(page.getByRole('heading', { name: /Physics/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Chemistry/ })).toBeVisible()
  })

  test('shows the correct result count', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await expect(page.getByText('2件の過去問が見つかりました')).toBeVisible()
  })

  test('search input filters results', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await expect(page.getByRole('heading', { name: /Physics/ })).toBeVisible()

    await page.getByPlaceholder('科目名・タイトルで検索').fill('Phys')

    await expect(page.getByRole('heading', { name: /Physics/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Chemistry/ })).not.toBeVisible()
    await expect(page.getByText('1件の過去問が見つかりました')).toBeVisible()
  })

  test('clearing the search restores all results', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await expect(page.getByRole('heading', { name: /Physics/ })).toBeVisible()

    const input = page.getByPlaceholder('科目名・タイトルで検索')
    await input.fill('Phys')
    await input.fill('')

    await expect(page.getByText('2件の過去問が見つかりました')).toBeVisible()
  })

  test('shows error message on API failure', async ({ page }) => {
    // Override to simulate network error
    await page.route('**/script.google.com/**', (route) =>
      route.fulfill({ status: 500, body: '' }),
    )
    await page.goto(`${BASE}/tests`)
    await expect(page.getByText(/HTTP error!/)).toBeVisible()
    await expect(page.getByRole('button', { name: /再読み込み/ })).toBeVisible()
  })

  test('back button navigates to home', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await expect(page.getByRole('heading', { name: /Physics/ })).toBeVisible()

    await page.getByRole('button', { name: /ホームに戻る/ }).click()

    await expect(page).toHaveURL(`${BASE}/`)
    await expect(page.getByText('みんなで作る、試験対策の知識ベース')).toBeVisible()
  })

  test('clicking a card navigates to the test detail page', async ({ page }) => {
    await page.goto(`${BASE}/tests`)
    await page.getByRole('heading', { name: 'Physics (2024年度)' }).click()
    await expect(page).toHaveURL(`${BASE}/tests/EX001`)
  })
})

// ---------------------------------------------------------------------------
// AssignmentList page (/assignments) — uses static mock data, no API
// ---------------------------------------------------------------------------
test.describe('AssignmentList page', () => {
  test('shows the page heading', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await expect(page.getByRole('heading', { name: '課題情報' })).toBeVisible()
  })

  test('renders all 5 static assignments', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await expect(page.getByText('5件の課題情報が見つかりました')).toBeVisible()
  })

  test('semester filter: fall shows 2 items', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await page.getByRole('combobox').nth(1).selectOption('fall')
    await expect(page.getByText('2件の課題情報が見つかりました')).toBeVisible()
  })

  test('semester filter: spring shows 3 items', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await page.getByRole('combobox').nth(1).selectOption('spring')
    await expect(page.getByText('3件の課題情報が見つかりました')).toBeVisible()
  })

  test('search filter narrows results', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await page.getByPlaceholder('科目名・タイトルで検索').fill('アルゴリズム')
    await expect(page.getByText('1件の課題情報が見つかりました')).toBeVisible()
  })

  test('back button navigates to home', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await page.getByRole('button', { name: /ホームに戻る/ }).click()
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('clicking a card navigates to assignment detail', async ({ page }) => {
    await page.goto(`${BASE}/assignments`)
    await page.getByRole('heading', { name: /データ構造とアルゴリズムのレポート課題/ }).click()
    await expect(page).toHaveURL(`${BASE}/assignments/1`)
  })
})

// ---------------------------------------------------------------------------
// Navigation flows
// ---------------------------------------------------------------------------
test.describe('Navigation flows', () => {
  test('Home → TestList → Home round-trip', async ({ page }) => {
    await mockGasApi(page, [])

    await page.goto(`${BASE}/`)
    await page.getByRole('button', { name: '過去問を閲覧' }).click()
    await expect(page).toHaveURL(`${BASE}/tests`)

    await page.getByRole('button', { name: /ホームに戻る/ }).click()
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('Home → AssignmentList → Home round-trip', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.getByRole('button', { name: '課題を閲覧' }).click()
    await expect(page).toHaveURL(`${BASE}/assignments`)

    await page.getByRole('button', { name: /ホームに戻る/ }).click()
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('unknown URL redirects to home page', async ({ page }) => {
    await page.goto(`${BASE}/this-page-does-not-exist`)
    await expect(page).toHaveURL(`${BASE}/`)
    await expect(page.getByText('みんなで作る、試験対策の知識ベース')).toBeVisible()
  })
})
