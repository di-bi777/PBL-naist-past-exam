import { getAreaLabel, getTermLabel } from './options'

describe('getAreaLabel', () => {
  it('returns the Japanese label for a known key', () => {
    expect(getAreaLabel('Information')).toBe('情報科学領域')
    expect(getAreaLabel('Biological')).toBe('バイオサイエンス領域')
    expect(getAreaLabel('Materials')).toBe('物質創生科学領域')
  })

  it('returns the key itself when the key is not in the list', () => {
    expect(getAreaLabel('cs')).toBe('cs')
    expect(getAreaLabel('unknown')).toBe('unknown')
  })

  it('returns empty string when key is undefined', () => {
    expect(getAreaLabel(undefined)).toBe('')
  })

  it('returns empty string when key is an empty string', () => {
    expect(getAreaLabel('')).toBe('')
  })
})

describe('getTermLabel', () => {
  it('returns the Japanese label for a known key', () => {
    expect(getTermLabel('spring')).toBe('春学期')
    expect(getTermLabel('fall')).toBe('秋学期')
  })

  it('returns the key itself when the key is not in the list', () => {
    expect(getTermLabel('summer')).toBe('summer')
  })

  it('returns empty string when key is undefined (covers falsy-key branch)', () => {
    expect(getTermLabel(undefined)).toBe('')
  })

  it('returns empty string when key is an empty string', () => {
    expect(getTermLabel('')).toBe('')
  })
})
