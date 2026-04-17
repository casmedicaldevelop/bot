import type { WASocket } from 'baileys'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'open'

export interface AppState {
  sock: WASocket | null
  connected: boolean
  status: ConnectionStatus
  phone: string | null
}

export const appState: AppState = {
  sock: null,
  connected: false,
  status: 'disconnected',
  phone: null,
}
