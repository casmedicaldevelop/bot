import { appState } from './state.js'

export async function sendText(phone: string, text: string): Promise<void> {
  if (!appState.sock || !appState.connected) {
    throw new Error('WhatsApp not connected')
  }
  const jid = `${phone}@s.whatsapp.net`
  await appState.sock.sendMessage(jid, { text })
}
