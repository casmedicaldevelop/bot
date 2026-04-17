import { describe, it, expect, vi } from 'vitest'
import { buildServer } from './server.js'
import type { AppState } from '../whatsapp/state.js'

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { sock: null, connected: false, status: 'disconnected', ...overrides }
}

describe('GET /pair', () => {
  it('returns 400 when phone param is missing', async () => {
    const app = buildServer(makeState())
    const res = await app.inject({ method: 'GET', url: '/pair' })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toEqual({ error: 'phone is required' })
  })

  it('returns 503 when socket is not ready', async () => {
    const app = buildServer(makeState({ sock: null }))
    const res = await app.inject({ method: 'GET', url: '/pair?phone=573001111111' })
    expect(res.statusCode).toBe(503)
  })

  it('returns 409 when already registered', async () => {
    const mockSock = {
      authState: { creds: { registered: true } },
      requestPairingCode: vi.fn(),
    } as unknown as AppState['sock']
    const app = buildServer(makeState({ sock: mockSock }))
    const res = await app.inject({ method: 'GET', url: '/pair?phone=573001111111' })
    expect(res.statusCode).toBe(409)
  })

  it('returns pairing code in XXXX-XXXX format when not registered', async () => {
    const mockSock = {
      authState: { creds: { registered: false } },
      requestPairingCode: vi.fn().mockResolvedValue('ABCD-1234'),
    } as unknown as AppState['sock']
    const app = buildServer(makeState({ sock: mockSock }))
    const res = await app.inject({ method: 'GET', url: '/pair?phone=573001111111' })
    expect(res.statusCode).toBe(200)
    expect(res.json().code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })
})
