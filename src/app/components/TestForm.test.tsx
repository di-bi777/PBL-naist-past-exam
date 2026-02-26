import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { TestForm } from './TestForm'

// ---------------------------------------------------------------------------
// Globals mocked for every test
// ---------------------------------------------------------------------------

/** Immediately resolves FileReader.readAsDataURL with a fake base64 data URL. */
class MockFileReader {
  result = 'data:application/pdf;base64,dGVzdA=='
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  readAsDataURL(_: Blob) {
    // Call onload in the next microtask so the caller can attach it first.
    queueMicrotask(() => this.onload?.())
  }
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

beforeEach(() => {
  vi.stubGlobal('FileReader', MockFileReader)
  vi.stubGlobal('alert', vi.fn())
  vi.stubGlobal('fetch', vi.fn())
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderForm = (onNavigate = vi.fn()) =>
  render(<TestForm onNavigate={onNavigate} previousPage="test-list" />, { wrapper })

/** Fill the minimum required fields (subject, area, semester). */
const fillRequiredFields = (container: HTMLElement) => {
  const textInputs = container.querySelectorAll('input[type="text"]')
  fireEvent.change(textInputs[0], { target: { value: 'Physics' } }) // subject

  const selects = container.querySelectorAll('select')
  fireEvent.change(selects[0], { target: { value: 'Information' } }) // area
  fireEvent.change(selects[1], { target: { value: 'spring' } })       // semester
}

/** Attach a fake PDF file to the hidden file input. */
const uploadFile = (container: HTMLElement, name = 'exam.pdf') => {
  const file = new File(['pdf content'], name, { type: 'application/pdf' })
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  })
  return file
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('TestForm', () => {
  // --- rendering ---
  it('renders the form title', () => {
    renderForm()
    expect(screen.getByText('過去問を登録')).toBeInTheDocument()
  })

  it('renders a submit button with correct label', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /登録する/ })).toBeInTheDocument()
  })

  it('renders a cancel / back button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument()
  })

  it('renders area options in Japanese', () => {
    renderForm()
    expect(screen.getByText('情報科学領域')).toBeInTheDocument()
    expect(screen.getByText('バイオサイエンス領域')).toBeInTheDocument()
    expect(screen.getByText('物質創生科学領域')).toBeInTheDocument()
  })

  it('renders semester options in Japanese', () => {
    renderForm()
    expect(screen.getByText('春学期')).toBeInTheDocument()
    expect(screen.getByText('秋学期')).toBeInTheDocument()
  })

  // --- navigation ---
  it('cancel button calls onNavigate with previousPage', () => {
    const onNavigate = vi.fn()
    renderForm(onNavigate)
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/ }))
    expect(onNavigate).toHaveBeenCalledWith('test-list')
  })

  // --- validation ---
  it('shows an alert when submitting without a file selected', async () => {
    const { container } = renderForm()
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('ファイルをアップロードしてください')
    })
  })

  it('does NOT call fetch when no file is selected', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()
    fireEvent.submit(container.querySelector('form')!)
    // Give enough time for any async fetch that shouldn't happen
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // --- file selection ---
  it('shows selected filename after file is chosen', async () => {
    const { container } = renderForm()
    uploadFile(container, 'midterm_2024.pdf')
    await waitFor(() => {
      expect(screen.getByText('midterm_2024.pdf')).toBeInTheDocument()
    })
  })

  // --- filename preview ---
  it('shows save-name preview containing area label, subject, and year', async () => {
    const { container } = renderForm()
    const currentYear = new Date().getFullYear()

    fillRequiredFields(container)
    uploadFile(container)

    // The preview renders as: "保存名: 情報科学領域_Physics_{year}"
    // Use a <p>-specific selector to avoid matching the Upload SVG icon which also
    // receives the text-blue-500 class when a file is selected.
    await waitFor(() => {
      const preview = container.querySelector('p.text-blue-500')
      expect(preview?.textContent).toContain('情報科学領域')
      expect(preview?.textContent).toContain('Physics')
      expect(preview?.textContent).toContain(String(currentYear))
    })
  })

  // --- successful submission ---
  it('calls onNavigate("test-list") after a successful API response', async () => {
    const onNavigate = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    }))
    const { container } = renderForm(onNavigate)

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('test-list')
    })
  })

  it('sends a POST to the GAS endpoint with correct URL path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('upload_exam')
    expect(options.method).toBe('POST')
  })

  it('sends fileName in the format {AreaLabel}_{Subject}_{Year}.{ext}', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()
    const currentYear = new Date().getFullYear()

    fillRequiredFields(container)
    uploadFile(container, 'exam.pdf')
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.fileName).toBe(`情報科学領域_Physics_${currentYear}.pdf`)
    expect(body.mimeType).toBe('application/pdf')
    expect(body.subject).toBe('Physics')
    expect(body.term).toBe('spring')
  })

  // --- error handling ---
  it('shows an error alert when the API returns a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ status: 'error', message: 'Server error' })),
    }))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('エラーが発生しました'),
      )
    })
  })

  it('shows an error alert when the API returns status !== "success"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'error', message: 'Quota exceeded' })),
    }))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Quota exceeded'),
      )
    })
  })

  // --- loading state ---
  it('disables the submit button while uploading', async () => {
    // A fetch that never resolves keeps the component in the uploading state.
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /送信中/ })).toBeDisabled()
    })
  })

  it('shows uploading text in the submit button while uploading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByText('送信中...')).toBeInTheDocument()
    })
  })

  // --- field changes ---
  it('updates professor field value when typed into', () => {
    const { container } = renderForm()
    const textInputs = container.querySelectorAll<HTMLInputElement>('input[type="text"]')
    // textInputs[0] = subject, textInputs[1] = professor (instructor)
    fireEvent.change(textInputs[1], { target: { value: 'Prof. Smith' } })
    expect(textInputs[1].value).toBe('Prof. Smith')
  })

  it('updates year field value when changed', () => {
    const { container } = renderForm()
    const numberInput = container.querySelector<HTMLInputElement>('input[type="number"]')!
    fireEvent.change(numberInput, { target: { value: '2023' } })
    expect(numberInput.value).toBe('2023')
  })

  it('shows error alert when API returns non-JSON text (covers JSON.parse catch branch)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Internal Server Error'),
    }))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('エラーが発生しました'),
      )
    })
  })

  // --- file-input false branch ---
  it('does not set file when handleFileChange fires with no files (covers && false branch)', () => {
    const { container } = renderForm()
    const fileInput = container.querySelector('input[type="file"]')!
    fireEvent.change(fileInput, { target: { files: [] } })
    // File state stays null — no preview element appears
    expect(container.querySelector('p.text-blue-500')).not.toBeInTheDocument()
  })

  // --- English language branches ---
  it('shows English no-file alert when submitting without a file in English mode', async () => {
    localStorage.setItem('language', 'en')
    const { container } = renderForm()
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please upload a file')
    })
  })

  it('shows English success alert after a successful upload in English mode', async () => {
    localStorage.setItem('language', 'en')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    }))
    const { container } = renderForm()
    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Past exam registered'),
      )
    })
  })

  it('shows English error alert when API returns an error in English mode', async () => {
    localStorage.setItem('language', 'en')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'error', message: 'Upload failed' })),
    }))
    const { container } = renderForm()
    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('An error occurred'),
      )
    })
  })

  it('shows error alert when response text is empty (covers if (text) false branch)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    }))
    const { container } = renderForm()
    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('エラーが発生しました'))
    })
  })

  it('shows English "Submission failed" fallback when text is empty in English mode', async () => {
    localStorage.setItem('language', 'en')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(''),
    }))
    const { container } = renderForm()
    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('An error occurred'))
    })
  })

  it('submits without area selected to cover getAreaLabel || fallback branch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()
    // Only set subject — area stays '' so getAreaLabel('') = '' and the || right side executes
    const textInputs = container.querySelectorAll('input[type="text"]')
    fireEvent.change(textInputs[0], { target: { value: 'Physics' } })
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('過去問を登録しました'))
  })

  // --- English language branches ---
  it('shows English uploading text in loading overlay (covers language ternary in overlay)', async () => {
    localStorage.setItem('language', 'en')
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = renderForm()
    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/Saving as/)).toBeInTheDocument()
    })
  })

  it('shows "Subject" placeholder in English save-name preview when subject is empty', async () => {
    localStorage.setItem('language', 'en')
    const { container } = renderForm()
    uploadFile(container)  // no fillRequiredFields — subject stays empty
    await waitFor(() => {
      const preview = container.querySelector('p.text-blue-500')
      expect(preview?.textContent).toContain('Subject')
    })
  })

  // --- checkbox interaction ---
  it('toggles allowed materials checkbox on and off', () => {
    const { container } = renderForm()
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    expect(checkboxes.length).toBeGreaterThan(0)

    // First click: adds the item
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0].checked).toBe(true)

    // Second click: removes the item
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0].checked).toBe(false)
  })
})
