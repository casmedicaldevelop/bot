import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from 'baileys'
import { Boom } from '@hapi/boom'
import { rmSync } from 'fs'
import { appState } from '../whatsapp/state.js'

async function createSocket() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    browser: Browsers.ubuntu('Chrome'),
  })

  appState.sock = sock
  appState.status = 'connecting'

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      appState.connected = true
      appState.status = 'open'
      appState.phone = sock.authState.creds.me?.id?.split('@')[0] ?? null
      console.log('[whatsapp] connected')
    }

    if (connection === 'close') {
      appState.connected = false
      appState.status = 'disconnected'
      appState.phone = null
      appState.sock = null

      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('[whatsapp] logged out — call /pair to re-link')
        return
      }

      if (!sock.authState.creds.registered) {
        console.log('[whatsapp] not registered — waiting for /pair')
        return
      }

      console.log(`[whatsapp] disconnected (${statusCode}) — reconnecting in 5s`)
      setTimeout(() => createSocket(), 5000)
    }
  })

  sock.ev.on('creds.update', saveCreds)
  return sock
}

export async function startConnection(): Promise<void> {
  await createSocket()
}

export async function clearSession(): Promise<void> {
  if (appState.sock) {
    try { appState.sock.ws.close() } catch { /* ignore */ }
    appState.sock = null
  }
  appState.connected = false
  appState.status = 'disconnected'
  appState.phone = null
  rmSync('./auth_info_baileys', { recursive: true, force: true })
  await createSocket()
}

export async function restartForPairing(phone: string): Promise<string> {
  if (appState.sock) {
    try { appState.sock.ws.close() } catch { /* ignore */ }
    appState.sock = null
  }
  rmSync('./auth_info_baileys', { recursive: true, force: true })
  const sock = await createSocket()

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout waiting for pair-device')), 30000)

    const onUpdate = async (update: { qr?: string; connection?: string }) => {
      if (update.connection === 'close') {
        sock.ev.off('connection.update', onUpdate)
        clearTimeout(timeout)
        reject(new Error('socket closed before pairing'))
        return
      }
      if (!update.qr) return
      sock.ev.off('connection.update', onUpdate)
      clearTimeout(timeout)
      try {
        const code = await sock.requestPairingCode(phone)
        resolve(code)
      } catch (err) {
        reject(err)
      }
    }

    sock.ev.on('connection.update', onUpdate)
  })
}
