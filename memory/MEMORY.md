# Project Memory: PBL-NAIST-PAST-EXAM

## Tech Stack
- Vite 6 + React 18 + TypeScript SPA (NOT Next.js)
- React Router DOM v6 for routing
- Tailwind CSS 4 + Radix UI / shadcn components
- Google Apps Script backend + Netlify Functions proxy
- Package manager: npm (package-lock.json present)

## Testing Setup (added)
- Vitest + React Testing Library + jsdom
- `npm test` (run once), `npm run test:watch`, `npm run test:ui`, `npm run test:coverage`
- Setup file: `src/test/setup.ts` — includes in-memory localStorage mock (jsdom lacks .clear())
- Type declarations: `src/test/vitest.d.ts` (vitest/globals triple-slash reference)

## Test Files Created
| File | Tests | Coverage |
|------|-------|---------|
| `src/test/smoke.test.ts` | 2 | setup verification |
| `src/app/contexts/LanguageContext.test.tsx` | 19 | i18n context |
| `src/app/utils/formatters.test.ts` | 25 | formatBytes, formatDateTime |
| `src/app/utils/tagResolver.test.ts` | 27 | buildTagsByFileId, resolveFileTags |

## Utility Files Extracted (for testability)
- `src/app/utils/formatters.ts` — `formatBytes`, `formatDateTime` (extracted from AdminPage.tsx)
- `src/app/utils/tagResolver.ts` — `DriveFile`, `FileTag` types + `buildTagsByFileId`, `resolveFileTags` (extracted from AdminPage.tsx useMemo)

## Key Files
- `src/app/App.tsx` — React Router root
- `src/app/contexts/LanguageContext.tsx` — i18n (ja/en), saved to localStorage
- `src/app/constants/pastExamsDb.ts` — hardcoded past exam DB rows
- `src/app/constants/gasAdmin.ts` — admin GAS endpoints (Netlify Functions proxy)
- `netlify/functions/gas-proxy.js` — Netlify Function CORS proxy for GAS

## Testing Plan Progress
- [x] Step 1: Vitest + RTL setup
- [x] Step 2: LanguageContext tests (19)
- [x] Step 3: formatters pure function tests (25)
- [x] Step 4: tagResolver (tag resolution logic) tests (27)
- [x] Step 5: TestForm (17) / AssignmentForm (18) — vi.stubGlobal for fetch/alert/FileReader
- [x] Step 6: TestList (21) / AssignmentList (19) — total 148 tests
- [x] Step 7: gas-proxy.js Netlify Function tests (31) — vi.stubEnv for process.env, vi.stubGlobal for fetch
- [x] Step 8: E2E (Playwright) — 21 tests in e2e/app.spec.ts; chromium only

## E2E Notes
- App uses BrowserRouter basename="/PBL-naist-past-exam/" → all paths prefixed with /PBL-naist-past-exam/
- Site title h1 appears in BOTH Header and HomePage → assert subtitle text instead:
  '過去問共有プラットフォーム' (2 elements) vs unique 'みんなで作る、試験対策の知識ベース'
- page.route('**/script.google.com/**', ...) mocks GAS API calls
- playwright.config.ts: webServer starts `npm run dev`, only Chromium browser

## Key Testing Patterns
- Subject text appears twice in TestList/AssignmentList cards (h3 title + BookOpen span)
  → Use `screen.getByRole('heading', { name: /Subject/ })` not `getByText(/Subject/)`
- AssignmentList area filter bug: mock data uses 'cs'/'bio'/'mat' but dropdown uses
  'Information'/'Biological'/'Materials' — area filter always returns 0 results
- AssignmentList uses static mock data (no fetch), no LanguageProvider wrapper needed
