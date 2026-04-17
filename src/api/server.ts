import Fastify from 'fastify'
import type { AppState } from '../whatsapp/state.js'
import { registerHealthRoute } from './health.route.js'
import { registerPairRoute } from './pair.route.js'
import { registerSessionRoute } from './session.route.js'
import { registerUiRoute } from './ui.route.js'

export function buildServer(state: AppState) {
  const app = Fastify({ logger: false })
  registerUiRoute(app)
  registerHealthRoute(app, state)
  registerPairRoute(app, state)
  registerSessionRoute(app)
  return app
}
