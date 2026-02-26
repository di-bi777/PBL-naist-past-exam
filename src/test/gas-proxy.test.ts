// @ts-ignore - gas-proxy.js is a plain JS Netlify Function; vitest handles it at runtime
import { handler } from '../../netlify/functions/gas-proxy.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal Netlify event object. */
const makeEvent = (overrides: Record<string, unknown> = {}) => ({
  httpMethod: 'GET',
  headers: {} as Record<string, string>,
  queryStringParameters: { route: 'db' } as Record<string, string>,
  body: null as string | null,
  ...overrides,
})

/** Minimal fetch Response stub accepted by the handler. */
const makeUpstream = (overrides: Record<string, unknown> = {}) => ({
  status: 200,
  headers: { get: (_key: string) => 'application/json' },
  text: () => Promise.resolve(JSON.stringify({ ok: true })),
  ...overrides,
})

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeUpstream()))

  // Primary env vars (used by the handler via process.env.GAS_*)
  vi.stubEnv('ADMIN_API_TOKEN', 'test-token')
  vi.stubEnv('GAS_DB_ENDPOINT', 'https://gas.example.com/db')
  vi.stubEnv('GAS_DRIVE_ENDPOINT', 'https://gas.example.com/drive')
  vi.stubEnv('GAS_REJECT_ENDPOINT', 'https://gas.example.com/reject')
  vi.stubEnv('GAS_APPROVE_ENDPOINT', 'https://gas.example.com/approve')

  // VITE_ fallbacks disabled so primary vars take effect exclusively
  vi.stubEnv('VITE_ADMIN_API_TOKEN', '')
  vi.stubEnv('VITE_GAS_DB_ENDPOINT', '')
  vi.stubEnv('VITE_GAS_DRIVE_ENDPOINT', '')
  vi.stubEnv('VITE_GAS_REJECT_ENDPOINT', '')
  vi.stubEnv('VITE_GAS_APPROVE_ENDPOINT', '')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('gas-proxy handler', () => {
  // --- CORS preflight ---
  describe('OPTIONS preflight', () => {
    it('returns 204 for OPTIONS requests', async () => {
      const res = await handler(makeEvent({ httpMethod: 'OPTIONS' }))
      expect(res.statusCode).toBe(204)
      expect(res.body).toBe('')
    })

    it('includes all CORS headers in the OPTIONS response', async () => {
      const res = await handler(makeEvent({ httpMethod: 'OPTIONS' }))
      expect(res.headers).toMatchObject(CORS_HEADERS)
    })

    it('does NOT call upstream fetch for OPTIONS requests', async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      await handler(makeEvent({ httpMethod: 'OPTIONS' }))
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  // --- Admin token authentication (reject and approve routes) ---
  describe('admin token auth', () => {
    it('returns 401 when no ADMIN_API_TOKEN env var is set', async () => {
      vi.stubEnv('ADMIN_API_TOKEN', '')
      vi.stubEnv('VITE_ADMIN_API_TOKEN', '')

      const res = await handler(makeEvent({
        queryStringParameters: { route: 'reject' },
        headers: {},
      }))

      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body)).toMatchObject({ status: 'error', message: 'unauthorized' })
    })

    it('returns 401 when the wrong token is provided', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'reject' },
        headers: { 'x-admin-token': 'wrong-token' },
      }))
      expect(res.statusCode).toBe(401)
    })

    it('returns 401 when no token header is provided for reject route', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'reject' },
        headers: {},
      }))
      expect(res.statusCode).toBe(401)
    })

    it('passes auth with correct token in x-admin-token header', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'reject' },
        headers: { 'x-admin-token': 'test-token' },
      }))
      expect(res.statusCode).toBe(200)
    })

    it('passes auth with correct token in X-Admin-Token header (uppercase variant)', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'approve' },
        headers: { 'X-Admin-Token': 'test-token' },
      }))
      expect(res.statusCode).toBe(200)
    })

    it('does NOT require auth for route=db', async () => {
      const res = await handler(makeEvent({ queryStringParameters: { route: 'db' } }))
      expect(res.statusCode).toBe(200)
    })

    it('does NOT require auth for route=drive', async () => {
      const res = await handler(makeEvent({ queryStringParameters: { route: 'drive' } }))
      expect(res.statusCode).toBe(200)
    })

    it('defaults to route=reject when no route param is given (requires auth)', async () => {
      // default route is "reject" → needs admin token → none provided → 401
      const res = await handler(makeEvent({
        queryStringParameters: {},
        headers: {},
      }))
      expect(res.statusCode).toBe(401)
    })
  })

  // --- Endpoint resolution ---
  describe('endpoint resolution', () => {
    it('returns 500 for an unknown route with no matching endpoint', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'unknown' },
      }))
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body)).toMatchObject({
        status: 'error',
        message: expect.stringContaining('unknown'),
      })
    })

    it('returns 500 when the env var for the route is empty', async () => {
      vi.stubEnv('GAS_DB_ENDPOINT', '')
      vi.stubEnv('VITE_GAS_DB_ENDPOINT', '')

      const res = await handler(makeEvent({ queryStringParameters: { route: 'db' } }))
      expect(res.statusCode).toBe(500)
    })

    it('falls back to the VITE_ variant when the primary env var is empty', async () => {
      vi.stubEnv('GAS_DB_ENDPOINT', '')
      vi.stubEnv('VITE_GAS_DB_ENDPOINT', 'https://vite-fallback.example.com/db')

      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ queryStringParameters: { route: 'db' } }))

      const [url] = fetchMock.mock.calls[0]
      expect(url).toContain('vite-fallback.example.com')
    })
  })

  // --- URL construction ---
  describe('URL construction', () => {
    it('calls upstream with the bare endpoint when no extra query params', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ queryStringParameters: { route: 'db' } }))

      const [url] = fetchMock.mock.calls[0]
      expect(url).toBe('https://gas.example.com/db')
    })

    it('appends extra query params to the URL and strips the route param', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({
        queryStringParameters: { route: 'db', fileId: 'abc123', action: 'list' },
      }))

      const [url] = fetchMock.mock.calls[0]
      expect(url).toContain('fileId=abc123')
      expect(url).toContain('action=list')
      expect(url).not.toContain('route=')
    })
  })

  // --- Request proxying ---
  describe('request proxying', () => {
    it('forwards the HTTP method to upstream', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ httpMethod: 'POST', body: '{"x":1}' }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.method).toBe('POST')
    })

    it('sends undefined body for GET requests', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ httpMethod: 'GET' }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.body).toBeUndefined()
    })

    it('sends undefined body for HEAD requests', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ httpMethod: 'HEAD' }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.body).toBeUndefined()
    })

    it('forwards the body for POST requests', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)
      const body = JSON.stringify({ data: 'test' })

      await handler(makeEvent({ httpMethod: 'POST', body }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.body).toBe(body)
    })

    it('uses the content-type from the incoming request headers', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ headers: { 'content-type': 'text/plain' } }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.headers['Content-Type']).toBe('text/plain')
    })

    it('defaults Content-Type to application/json when no header is present', async () => {
      const fetchMock = vi.fn().mockResolvedValue(makeUpstream())
      vi.stubGlobal('fetch', fetchMock)

      await handler(makeEvent({ headers: {} }))

      const [, options] = fetchMock.mock.calls[0]
      expect(options.headers['Content-Type']).toBe('application/json')
    })
  })

  // --- Response forwarding ---
  describe('response forwarding', () => {
    it('returns the upstream HTTP status code', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeUpstream({ status: 201 })))
      const res = await handler(makeEvent())
      expect(res.statusCode).toBe(201)
    })

    it('returns the upstream body text verbatim', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        makeUpstream({ text: () => Promise.resolve('upstream response body') }),
      ))
      const res = await handler(makeEvent())
      expect(res.body).toBe('upstream response body')
    })

    it('forwards the Content-Type from upstream response headers', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        makeUpstream({
          headers: { get: (h: string) => h === 'content-type' ? 'text/html; charset=utf-8' : null },
        }),
      ))
      const res = await handler(makeEvent())
      expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8')
    })

    it('falls back to application/json when upstream Content-Type is null', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
        makeUpstream({ headers: { get: () => null } }),
      ))
      const res = await handler(makeEvent())
      expect(res.headers['Content-Type']).toBe('application/json')
    })

    it('includes CORS headers in a successful proxy response', async () => {
      const res = await handler(makeEvent())
      expect(res.headers).toMatchObject(CORS_HEADERS)
    })

    it('includes CORS headers in an auth-error (401) response', async () => {
      const res = await handler(makeEvent({
        queryStringParameters: { route: 'reject' },
        headers: {},
      }))
      expect(res.headers).toMatchObject(CORS_HEADERS)
    })

    it('includes CORS headers in a 500 error response', async () => {
      const res = await handler(makeEvent({ queryStringParameters: { route: 'unknown' } }))
      expect(res.headers).toMatchObject(CORS_HEADERS)
    })
  })

  // --- Error handling ---
  describe('error handling', () => {
    it('returns 500 when fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))
      const res = await handler(makeEvent())
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body)).toMatchObject({
        status: 'error',
        message: expect.stringContaining('Network failure'),
      })
    })

    it('includes CORS headers even when fetch throws', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')))
      const res = await handler(makeEvent())
      expect(res.headers).toMatchObject(CORS_HEADERS)
    })
  })
})
