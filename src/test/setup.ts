import '@testing-library/jest-dom'

// jsdom does not provide a fully functional localStorage by default.
// Provide an in-memory implementation so tests can call .clear(), .getItem(), etc.
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = String(value) },
    removeItem: (key: string): void => { delete store[key] },
    clear: (): void => { store = {} },
    get length(): number { return Object.keys(store).length },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true,
})
