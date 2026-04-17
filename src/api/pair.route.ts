import type { FastifyInstance } from 'fastify'
import type { AppState } from '../whatsapp/state.js'
import { restartForPairing } from '../flows/connection.flow.js'

export function registerPairRoute(app: FastifyInstance, state: AppState): void {
  app.get<{ Querystring: { phone?: string } }>('/pair', async (req, reply) => {
    const { phone } = req.query

    if (!phone) {
      return reply.status(400).send({ error: 'phone is required' })
    }

    if (state.connected) {
      return reply.status(409).send({ error: 'already connected' })
    }

    const code = await restartForPairing(phone)
    reply.send({ code })
  })
}
