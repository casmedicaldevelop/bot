import { readFileSync, writeFileSync } from 'fs'

const path = 'node_modules/baileys/lib/Utils/validate-connection.js'
const original = 'platform: proto.ClientPayload.UserAgent.Platform.WEB,'
const patched  = 'platform: proto.ClientPayload.UserAgent.Platform.MACOS,'

const content = readFileSync(path, 'utf8')
if (content.includes(patched)) {
  console.log('[patch-baileys] already applied, skipping')
  process.exit(0)
}
if (!content.includes(original)) {
  console.error('[patch-baileys] expected string not found — check Baileys version')
  process.exit(1)
}
writeFileSync(path, content.replace(original, patched))
console.log('[patch-baileys] Platform.WEB → Platform.MACOS applied')
