import type { WASocket } from 'baileys'

export function registerMessageHandlers(sock: WASocket): void {
  sock.ev.on('messages.upsert', ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue
      console.log(`[message] from ${msg.key.remoteJid}`)
    }
  })
}
