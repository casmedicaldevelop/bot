import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('config', () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.DATABASE_URL
  })

  afterEach(() => {
    Object.assign(process.env, original)
  })

  it('throws when DATABASE_URL is missing', async () => {
    await expect(import('./config.js')).rejects.toThrow('DATABASE_URL')
  })
})
