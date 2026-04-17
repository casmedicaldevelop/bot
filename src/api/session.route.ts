import type { FastifyInstance } from 'fastify'
import { clearSession } from '../flows/connection.flow.js'

export function registerSessionRoute(app: FastifyInstance): void {
  app.delete('/session', async (_req, reply) => {
    await clearSession()
    reply.send({ ok: true })
  })
}
