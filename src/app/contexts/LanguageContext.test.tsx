import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider, useLanguage } from './LanguageContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------
  describe('initial state', () => {
    it('defaults to Japanese when localStorage is empty', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('ja')
    })

    it('restores "ja" from localStorage', () => {
      localStorage.setItem('language', 'ja')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('ja')
    })

    it('restores "en" from localStorage', () => {
      localStorage.setItem('language', 'en')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('en')
    })

    it('falls back to "ja" for an invalid value in localStorage', () => {
      localStorage.setItem('language', 'fr')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.language).toBe('ja')
    })
  })

  // -----------------------------------------------------------------------
  // setLanguage
  // -----------------------------------------------------------------------
  describe('setLanguage', () => {
    it('switches from Japanese to English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(result.current.language).toBe('en')
    })

    it('switches back from English to Japanese', () => {
      localStorage.setItem('language', 'en')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('ja') })
      expect(result.current.language).toBe('ja')
    })

    it('persists the selected language to localStorage', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(localStorage.getItem('language')).toBe('en')
    })

    it('overwrites an existing localStorage value', () => {
      localStorage.setItem('language', 'en')
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('ja') })
      expect(localStorage.getItem('language')).toBe('ja')
    })
  })

  // -----------------------------------------------------------------------
  // t() — translation function
  // -----------------------------------------------------------------------
  describe('t()', () => {
    it('returns Japanese for a known key in ja mode', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('header.title')).toBe('過去問共有プラットフォーム')
    })

    it('returns English for a known key after switching to en', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(result.current.t('header.title')).toBe('Past Exam Sharing Platform')
    })

    it('returns the key itself for an unknown key', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('this.key.does.not.exist')).toBe('this.key.does.not.exist')
    })

    it('translates area labels in Japanese', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('area.Information')).toBe('情報科学領域')
      expect(result.current.t('area.Biological')).toBe('バイオサイエンス領域')
      expect(result.current.t('area.Materials')).toBe('物質創生科学領域')
    })

    it('translates area labels in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(result.current.t('area.Information')).toBe('Information Science')
      expect(result.current.t('area.Biological')).toBe('Bioscience')
      expect(result.current.t('area.Materials')).toBe('Materials Science')
    })

    it('translates term labels in Japanese', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('term.spring')).toBe('春学期')
      expect(result.current.t('term.fall')).toBe('秋学期')
    })

    it('translates term labels in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(result.current.t('term.spring')).toBe('Spring Semester')
      expect(result.current.t('term.fall')).toBe('Fall Semester')
    })

    it('updates translations reactively when language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('form.submit')).toBe('登録する')
      act(() => { result.current.setLanguage('en') })
      expect(result.current.t('form.submit')).toBe('Register')
    })

    it('translates admin token labels in Japanese', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      expect(result.current.t('admin.token.prompt')).toBe('管理者トークンを入力してください')
      expect(result.current.t('admin.tag.estimated')).toBe('推定一致')
    })

    it('translates admin token labels in English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper })
      act(() => { result.current.setLanguage('en') })
      expect(result.current.t('admin.token.prompt')).toBe('Enter admin token')
      expect(result.current.t('admin.tag.estimated')).toBe('Estimated Match')
    })
  })

  // -----------------------------------------------------------------------
  // useLanguage outside Provider
  // -----------------------------------------------------------------------
  describe('useLanguage outside LanguageProvider', () => {
    it('throws an error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => renderHook(() => useLanguage())).toThrow(
        'useLanguage must be used within a LanguageProvider'
      )
      consoleSpy.mockRestore()
    })
  })
})
