import type { FastifyInstance } from 'fastify'

export function registerUiRoute(app: FastifyInstance): void {
  app.get('/', async (_req, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CASMEDICAL Bot</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1e293b; border-radius: 12px; padding: 40px; width: 100%; max-width: 420px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
    label { font-size: 13px; color: #94a3b8; display: block; margin-bottom: 6px; }
    .prefix-wrap { display: flex; gap: 8px; align-items: center; }
    .prefix { padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #64748b; font-size: 15px; white-space: nowrap; }
    input { flex: 1; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #f1f5f9; font-size: 15px; outline: none; }
    input:focus { border-color: #3b82f6; }
    button { width: 100%; margin-top: 16px; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    button:hover { background: #2563eb; }
    button:disabled { background: #475569; cursor: not-allowed; }
    button.danger { background: #dc2626; }
    button.danger:hover { background: #b91c1c; }
    .code-box { margin-top: 24px; background: #0f172a; border-radius: 8px; padding: 24px; text-align: center; display: none; }
    .code { font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #22c55e; font-variant-numeric: tabular-nums; }
    .code-hint { font-size: 13px; color: #64748b; margin-top: 10px; }
    .error { margin-top: 16px; color: #f87171; font-size: 14px; display: none; }
    .status { margin-top: 20px; font-size: 13px; color: #64748b; text-align: center; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .dot.green { background: #22c55e; } .dot.red { background: #f87171; }
    .session-info { margin-top: 20px; background: #0f172a; border-radius: 8px; padding: 16px; display: none; }
    .session-phone { font-size: 18px; font-weight: 700; color: #22c55e; margin-bottom: 4px; }
    .session-label { font-size: 12px; color: #64748b; margin-bottom: 12px; }
    #pair-form { display: block; }
  </style>
</head>
<body>
  <div class="card">
    <h1>CASMEDICAL Bot</h1>
    <p id="subtitle">Vincula tu número de WhatsApp para activar el bot.</p>

    <div id="pair-form">
      <label>Número de WhatsApp (sin código de país)</label>
      <div class="prefix-wrap">
        <span class="prefix">+57</span>
        <input id="phone" type="tel" placeholder="3001111111" />
      </div>
      <button id="btn" onclick="pair()">Obtener código</button>

      <div class="code-box" id="codebox">
        <div class="code" id="code"></div>
        <div class="code-hint">WhatsApp → Ajustes → Dispositivos vinculados → Vincular con número</div>
      </div>
      <div class="error" id="error"></div>
    </div>

    <div class="session-info" id="session-info">
      <div class="session-phone" id="session-phone"></div>
      <div class="session-label">Número vinculado</div>
      <button class="danger" id="clear-btn" onclick="clearSession()">Borrar sesión y vincular otro número</button>
    </div>

    <div class="status" id="status">Verificando conexión...</div>
  </div>

  <script>
    async function checkHealth() {
      try {
        const res = await fetch('/health')
        const data = await res.json()
        const s = document.getElementById('status')
        const pairForm = document.getElementById('pair-form')
        const sessionInfo = document.getElementById('session-info')
        const subtitle = document.getElementById('subtitle')

        if (data.connected && data.phone) {
          s.innerHTML = '<span class="dot green"></span>Bot conectado'
          pairForm.style.display = 'none'
          sessionInfo.style.display = 'block'
          subtitle.textContent = 'Sesión activa en WhatsApp.'
          document.getElementById('session-phone').textContent = '+57 ' + data.phone.replace(/^57/, '')
        } else {
          s.innerHTML = '<span class="dot red"></span>Bot desconectado — ingresa el código para vincular'
          pairForm.style.display = 'block'
          sessionInfo.style.display = 'none'
          subtitle.textContent = 'Vincula tu número de WhatsApp para activar el bot.'
        }
      } catch { }
    }

    async function pair() {
      const phone = document.getElementById('phone').value.trim()
      const btn = document.getElementById('btn')
      const codebox = document.getElementById('codebox')
      const codeEl = document.getElementById('code')
      const errorEl = document.getElementById('error')

      errorEl.style.display = 'none'
      codebox.style.display = 'none'

      if (!phone) { showError('Ingresa el número de teléfono'); return }

      btn.disabled = true
      btn.textContent = 'Solicitando...'

      try {
        const res = await fetch('/pair?phone=57' + phone)
        const data = await res.json()
        if (!res.ok) { showError(data.error || 'Error al solicitar código'); return }
        codeEl.textContent = data.code
        codebox.style.display = 'block'
      } catch (e) {
        showError('Error de red')
      } finally {
        btn.disabled = false
        btn.textContent = 'Obtener código'
      }
    }

    async function clearSession() {
      const btn = document.getElementById('clear-btn')
      btn.disabled = true
      btn.textContent = 'Borrando...'
      try {
        await fetch('/session', { method: 'DELETE' })
        document.getElementById('session-info').style.display = 'none'
        document.getElementById('pair-form').style.display = 'block'
        document.getElementById('subtitle').textContent = 'Vincula tu número de WhatsApp para activar el bot.'
      } catch (e) {
        btn.disabled = false
        btn.textContent = 'Borrar sesión y vincular otro número'
      }
    }

    function showError(msg) {
      const el = document.getElementById('error')
      el.textContent = msg
      el.style.display = 'block'
    }

    checkHealth()
    setInterval(checkHealth, 5000)
  </script>
</body>
</html>`)
  })
}
