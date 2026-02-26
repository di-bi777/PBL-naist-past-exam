describe('test setup', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('jest-dom matchers should be available', () => {
    const div = document.createElement('div')
    div.textContent = 'hello'
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
    document.body.removeChild(div)
  })
})
