import { NextRequest, NextResponse } from 'next/server'
import { sendDailyReminders, sendStreakMilestones } from '@/lib/whatsapp/reminders'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type') ?? 'daily'

  try {
    if (type === 'milestones') {
      const result = await sendStreakMilestones()
      return NextResponse.json({ ok: true, type: 'milestones', ...result })
    }

    // Default: daily reminders
    const result = await sendDailyReminders()
    return NextResponse.json({ ok: true, type: 'daily', ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Cron] whatsapp-reminders failed:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
