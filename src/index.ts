import 'dotenv/config'
import { config } from './config.js'
import { appState } from './whatsapp/state.js'
import { startConnection } from './flows/connection.flow.js'
import { buildServer } from './api/server.js'

const THREE_HOURS = 3 * 60 * 60 * 1000

setTimeout(() => {
  console.log('[memory] scheduled restart — mitigating Baileys memory leak')
  process.exit(0)
}, THREE_HOURS)

const app = buildServer(appState)

await app.listen({ port: config.port, host: '0.0.0.0' })
console.log(`[api] listening on port ${config.port}`)

await startConnection()
