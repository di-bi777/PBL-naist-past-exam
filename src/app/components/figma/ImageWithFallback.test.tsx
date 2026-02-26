import { render, screen, fireEvent } from '@testing-library/react'
import { ImageWithFallback } from './ImageWithFallback'

describe('ImageWithFallback', () => {
  it('renders an img with the given src and alt', () => {
    render(<ImageWithFallback src="test.png" alt="Test image" />)
    const img = screen.getByAltText('Test image') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('test.png')
  })

  it('shows a fallback element when the image fails to load', () => {
    render(<ImageWithFallback src="broken.png" alt="Broken image" />)
    const img = screen.getByAltText('Broken image')
    fireEvent.error(img)
    // After the error event, the fallback SVG placeholder is shown
    expect(screen.getByAltText('Error loading image')).toBeInTheDocument()
    expect(screen.queryByAltText('Broken image')).not.toBeInTheDocument()
  })

  it('passes extra props to the img element', () => {
    render(<ImageWithFallback src="test.png" alt="Test" data-testid="img-el" />)
    expect(screen.getByTestId('img-el')).toBeInTheDocument()
  })
})
