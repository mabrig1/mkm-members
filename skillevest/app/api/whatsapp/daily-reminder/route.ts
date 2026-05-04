import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Enrollment, UserTask } from '@/lib/mongodb/models'

const CRON_SECRET = process.env.CRON_SECRET
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID

async function sendWhatsAppMessage(to: string, name: string, streakDays: number, taskUrl: string) {
  const phone = to.replace(/\D/g, '').replace(/^0/, '234')

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'daily_streak_reminder',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: name.split(' ')[0] },
                { type: 'text', text: String(streakDays) },
                { type: 'text', text: taskUrl },
              ],
            },
          ],
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(JSON.stringify(err))
  }

  return res.json()
}

export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Find users with active streaks who have whatsapp_optin and a phone number
  const activeUsers = await Profile.find({
    streak_days: { $gt: 0 },
    whatsapp_optin: true,
    phone: { $exists: true, $ne: null },
    onboarding_completed: true,
  })
    .select('_id full_name phone streak_days')
    .lean()

  if (activeUsers.length === 0) {
    return NextResponse.json({ notified: 0, skipped: 0, message: 'No eligible users' })
  }

  // Filter: only users who have NOT submitted a task today
  const userIds = activeUsers.map(u => u._id)
  const submittedToday = await UserTask.find({
    user_id: { $in: userIds },
    updated_at: { $gte: todayStart },
    status: { $in: ['submitted', 'graded'] },
  })
    .select('user_id')
    .lean()

  const submittedSet = new Set(submittedToday.map(t => t.user_id.toString()))
  const toNotify = activeUsers.filter(u => !submittedSet.has(u._id.toString()))

  // For each user to notify, find their current active enrollment to get the task URL
  const enrollments = await Enrollment.find({
    user_id: { $in: toNotify.map(u => u._id) },
    status: 'active',
  })
    .select('user_id track_id current_day')
    .populate('track_id', 'slug')
    .lean()

  const enrollmentMap = new Map(
    enrollments.map(e => [e.user_id.toString(), e])
  )

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://skillevest.ng'

  const results = await Promise.allSettled(
    toNotify.map(async (user) => {
      const enrollment = enrollmentMap.get(user._id.toString())
      const taskUrl = enrollment
        ? `${appUrl}/tracks/${(enrollment.track_id as { slug?: string })?.slug ?? enrollment.track_id}`
        : `${appUrl}/tracks`

      await sendWhatsAppMessage(user.phone!, user.full_name, user.streak_days, taskUrl)
      return user._id
    })
  )

  const notified = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  const skipped = activeUsers.length - toNotify.length

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason?.message ?? String(r.reason))
    .slice(0, 5)

  console.log(`[WhatsApp Reminder] notified=${notified} skipped=${skipped} failed=${failed}`)

  return NextResponse.json({
    success: true,
    total_eligible: activeUsers.length,
    already_submitted: skipped,
    notified,
    failed,
    errors: errors.length ? errors : undefined,
  })
}

// Allow GET for manual health check / Vercel cron (which sends GET)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Delegate to POST handler
  return POST(request)
}
