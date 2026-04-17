import type { FastifyInstance } from 'fastify'
import type { AppState } from '../whatsapp/state.js'

export function registerHealthRoute(app: FastifyInstance, state: AppState): void {
  app.get('/health', async (_req, reply) => {
    reply.send({ connected: state.connected, status: state.status, phone: state.phone })
  })
}
