const TERMII_BASE = 'https://v3.api.termii.com'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`
  if (digits.startsWith('234')) return digits
  return digits
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const apiKey = process.env.TERMII_API_KEY
  if (!apiKey) {
    console.error('[WhatsApp] TERMII_API_KEY not set')
    return false
  }

  try {
    const res = await fetch(`${TERMII_BASE}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizePhone(to),
        from: process.env.TERMII_SENDER_ID ?? 'SkillVest',
        sms: message,
        type: 'unicode',
        channel: 'whatsapp',
        api_key: apiKey,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[WhatsApp] Termii error ${res.status}: ${body}`)
      return false
    }

    return true
  } catch (err) {
    console.error('[WhatsApp] Network error:', err)
    return false
  }
}
