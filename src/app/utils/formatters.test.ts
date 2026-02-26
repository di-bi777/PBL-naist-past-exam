import { formatBytes, formatDateTime } from './formatters'

// ---------------------------------------------------------------------------
// formatBytes
// ---------------------------------------------------------------------------
describe('formatBytes', () => {
  // --- guard clauses ---
  it('returns "—" for undefined', () => {
    expect(formatBytes(undefined)).toBe('—')
  })

  it('returns "—" for empty string', () => {
    expect(formatBytes('')).toBe('—')
  })

  it('returns "—" for a non-numeric string', () => {
    expect(formatBytes('abc')).toBe('—')
  })

  it('returns "—" for Infinity', () => {
    expect(formatBytes('Infinity')).toBe('—')
  })

  // --- byte range (B) ---
  it('formats 0 bytes', () => {
    expect(formatBytes('0')).toBe('0B')
  })

  it('formats 1 byte', () => {
    expect(formatBytes('1')).toBe('1B')
  })

  it('formats 500 bytes', () => {
    expect(formatBytes('500')).toBe('500B')
  })

  it('formats 1023 bytes (just below 1 KB)', () => {
    expect(formatBytes('1023')).toBe('1023B')
  })

  // --- kilobyte range (KB) ---
  it('formats exactly 1 KB with one decimal (value < 10)', () => {
    expect(formatBytes('1024')).toBe('1.0KB')
  })

  it('formats 9 KB with one decimal (value < 10)', () => {
    expect(formatBytes('9216')).toBe('9.0KB')
  })

  it('formats 10 KB with no decimal (value >= 10)', () => {
    expect(formatBytes('10240')).toBe('10KB')
  })

  it('formats 100 KB', () => {
    expect(formatBytes('102400')).toBe('100KB')
  })

  it('formats 1023 KB (just below 1 MB)', () => {
    expect(formatBytes(String(1023 * 1024))).toBe('1023KB')
  })

  // --- megabyte range (MB) ---
  it('formats exactly 1 MB with one decimal', () => {
    expect(formatBytes(String(1024 * 1024))).toBe('1.0MB')
  })

  it('formats 10 MB with no decimal', () => {
    expect(formatBytes(String(10 * 1024 * 1024))).toBe('10MB')
  })

  // --- gigabyte range (GB) ---
  it('formats exactly 1 GB with one decimal', () => {
    expect(formatBytes(String(1024 * 1024 * 1024))).toBe('1.0GB')
  })

  it('caps at GB even for very large values (no TB unit)', () => {
    // 1 TB expressed in bytes: 1024 GB = 1024 * 1024^3 bytes
    const tb = String(1024 * 1024 * 1024 * 1024)
    expect(formatBytes(tb)).toBe('1024GB')
  })
})

// ---------------------------------------------------------------------------
// formatDateTime
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  // --- guard clauses ---
  it('returns "—" for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('returns "—" for empty string', () => {
    expect(formatDateTime('')).toBe('—')
  })

  it('returns "—" for an unparseable string', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  // --- valid dates ---
  it('returns a non-empty string for a valid ISO date string', () => {
    const result = formatDateTime('2024-04-15T10:30:00Z')
    expect(result).not.toBe('—')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year for a valid date', () => {
    const result = formatDateTime('2024-04-15T10:30:00Z')
    expect(result).toContain('2024')
  })

  it('includes the month digits for a valid date', () => {
    const result = formatDateTime('2024-04-15T10:30:00Z')
    expect(result).toMatch(/04|4/)
  })

  it('accepts a custom locale and returns a string', () => {
    const result = formatDateTime('2024-04-15T10:30:00Z', 'en-US')
    expect(result).not.toBe('—')
    expect(result).toContain('2024')
  })

  it('formats a date string without a time component', () => {
    const result = formatDateTime('2023-01-01')
    expect(result).not.toBe('—')
    expect(result).toContain('2023')
  })
})
