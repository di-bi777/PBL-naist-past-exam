import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AssignmentForm } from './AssignmentForm'

// ---------------------------------------------------------------------------
// Globals mocked for every test
// ---------------------------------------------------------------------------

class MockFileReader {
  result = 'data:application/pdf;base64,dGVzdA=='
  onload: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  readAsDataURL(_: Blob) {
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
  render(
    <AssignmentForm onNavigate={onNavigate} previousPage="assignment-list" />,
    { wrapper },
  )

/** Fill the minimum required fields for a valid submission. */
const fillRequiredFields = (container: HTMLElement, lectureNumber = '3') => {
  // subject (first text input)
  const textInputs = container.querySelectorAll('input[type="text"]')
  fireEvent.change(textInputs[0], { target: { value: 'Algorithms' } })

  // lecture number (number input before selects)
  const numberInputs = container.querySelectorAll('input[type="number"]')
  fireEvent.change(numberInputs[0], { target: { value: lectureNumber } })

  // area (first select) and semester (second select)
  const selects = container.querySelectorAll('select')
  fireEvent.change(selects[0], { target: { value: 'Information' } })
  fireEvent.change(selects[1], { target: { value: 'fall' } })
}

const uploadFile = (container: HTMLElement, name = 'hw.pdf') => {
  const file = new File(['content'], name, { type: 'application/pdf' })
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  })
  return file
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AssignmentForm', () => {
  // --- rendering ---
  it('renders the assignment form title', () => {
    renderForm()
    expect(screen.getByText('課題を登録')).toBeInTheDocument()
  })

  it('renders a lecture number input field', () => {
    renderForm()
    // The lecture number label is "第何回講義"
    expect(screen.getByText('第何回講義')).toBeInTheDocument()
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

  it('renders a submit button with correct label', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /登録する/ })).toBeInTheDocument()
  })

  // --- navigation ---
  it('top cancel button calls onNavigate with previousPage', () => {
    const onNavigate = vi.fn()
    renderForm(onNavigate)
    // The first キャンセル button is the back arrow at the top
    const cancelButtons = screen.getAllByRole('button', { name: /キャンセル/ })
    fireEvent.click(cancelButtons[0])
    expect(onNavigate).toHaveBeenCalledWith('assignment-list')
  })

  it('footer cancel button calls onNavigate with previousPage', () => {
    const onNavigate = vi.fn()
    renderForm(onNavigate)
    const cancelButtons = screen.getAllByRole('button', { name: /キャンセル/ })
    // The footer has a second cancel button
    fireEvent.click(cancelButtons[cancelButtons.length - 1])
    expect(onNavigate).toHaveBeenCalledWith('assignment-list')
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
    await new Promise((r) => setTimeout(r, 50))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // --- file selection ---
  it('shows selected filename after file is chosen', async () => {
    const { container } = renderForm()
    uploadFile(container, 'assignment3.pdf')
    await waitFor(() => {
      expect(screen.getByText('assignment3.pdf')).toBeInTheDocument()
    })
  })

  // --- filename preview ---
  it('shows save-name preview with 第N回_課題 format', async () => {
    const { container } = renderForm()
    fillRequiredFields(container, '5')
    uploadFile(container)

    await waitFor(() => {
      // Preview: "保存名: 情報科学領域_Algorithms_第5回_課題"
      const preview = container.querySelector('p.text-blue-500')
      expect(preview?.textContent).toContain('情報科学領域')
      expect(preview?.textContent).toContain('Algorithms')
      expect(preview?.textContent).toContain('第5回')
      expect(preview?.textContent).toContain('課題')
    })
  })

  // --- successful submission ---
  it('calls onNavigate("assignment-list") after a successful API response', async () => {
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
      expect(onNavigate).toHaveBeenCalledWith('assignment-list')
    })
  })

  it('sends a POST to the upload_assignment endpoint', async () => {
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
    expect(url).toContain('upload_assignment')
    expect(options.method).toBe('POST')
  })

  it('sends fileName in the format {AreaLabel}_{Subject}_第{N}回_課題.{ext}', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ status: 'success' })),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()
    const currentYear = new Date().getFullYear()

    fillRequiredFields(container, '7')
    uploadFile(container, 'hw.pdf')
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.fileName).toBe(`情報科学領域_Algorithms_第7回_課題.pdf`)
    expect(body.mimeType).toBe('application/pdf')
    expect(body.subject).toBe('Algorithms')
    expect(body.term).toBe('fall')
    expect(body.year).toBe(currentYear)
  })

  // --- error handling ---
  it('shows an error alert when the API returns a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ status: 'error', message: 'Upload failed' })),
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
      text: () => Promise.resolve(JSON.stringify({ status: 'error', message: 'Storage full' })),
    }))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Storage full'),
      )
    })
  })

  // --- field changes ---
  it('updates year field value when changed', () => {
    const { container } = renderForm()
    const numberInputs = container.querySelectorAll<HTMLInputElement>('input[type="number"]')
    // numberInputs[0] = lecture number, numberInputs[1] = year
    fireEvent.change(numberInputs[1], { target: { value: '2023' } })
    expect(numberInputs[1].value).toBe('2023')
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

  // --- loading state ---
  it('disables the submit button while uploading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /送信中/ })).toBeDisabled()
    })
  })

  it('disables cancel buttons while uploading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = renderForm()

    fillRequiredFields(container)
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /キャンセル/ })
      cancelButtons.forEach((btn) => expect(btn).toBeDisabled())
    })
  })

  // --- file-input false branch ---
  it('does not set file when handleFileChange fires with no files (covers && false branch)', () => {
    const { container } = renderForm()
    const fileInput = container.querySelector('input[type="file"]')!
    fireEvent.change(fileInput, { target: { files: [] } })
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
        expect.stringContaining('Assignment registered'),
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
    const numberInputs = container.querySelectorAll('input[type="number"]')
    fireEvent.change(numberInputs[0], { target: { value: '3' } })
    uploadFile(container)
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('課題を登録しました'))
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

  it('shows "Area" and "Subject" placeholders in English save-name preview when both are empty', async () => {
    localStorage.setItem('language', 'en')
    const { container } = renderForm()
    uploadFile(container)  // no fillRequiredFields — area and subject stay empty
    await waitFor(() => {
      const preview = container.querySelector('p.text-blue-500')
      expect(preview?.textContent).toContain('Area')     // line 108 English branch
      expect(preview?.textContent).toContain('Subject')  // line 256 English branch
    })
  })
})
