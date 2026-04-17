import { describe, it, expect } from 'vitest'
import { buildServer } from './server.js'
import type { AppState } from '../whatsapp/state.js'

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { sock: null, connected: false, status: 'disconnected', ...overrides }
}

describe('GET /health', () => {
  it('returns disconnected when bot not connected', async () => {
    const app = buildServer(makeState())
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ connected: false, status: 'disconnected' })
  })

  it('returns connected when bot is open', async () => {
    const app = buildServer(makeState({ connected: true, status: 'open' }))
    const res = await app.inject({ method: 'GET', url: '/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ connected: true, status: 'open' })
  })
})
