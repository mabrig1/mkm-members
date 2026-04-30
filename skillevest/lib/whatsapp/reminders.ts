import { connectDB } from '@/lib/mongodb/connection'
import { Profile, Enrollment, UserTask, Withdrawal } from '@/lib/mongodb/models'
import { sendWhatsApp } from './client'
import { templates } from './templates'
import mongoose from 'mongoose'

/* ─── helpers ───────────────────────────────────────────────── */

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

interface PopulatedEnrollment {
  _id: mongoose.Types.ObjectId
  user_id: {
    _id: mongoose.Types.ObjectId
    full_name: string
    whatsapp_number?: string
    streak_days: number
  }
  track_id: {
    _id: mongoose.Types.ObjectId
    title: string
  }
  current_day: number
  status: string
}

/* ─── bulk jobs (called from cron) ─────────────────────────── */

/**
 * Send daily task reminders to users who:
 * - have an active enrollment
 * - have a whatsapp_number set
 * - have NOT submitted any task today
 */
export async function sendDailyReminders(): Promise<{ sent: number; skipped: number }> {
  await connectDB()

  const today = startOfToday()

  // All active enrollments with whatsapp-enabled users
  const enrollments = await Enrollment.find({ status: 'active' })
    .populate<{ user_id: PopulatedEnrollment['user_id'] }>('user_id', 'full_name whatsapp_number streak_days')
    .populate<{ track_id: PopulatedEnrollment['track_id'] }>('track_id', 'title')
    .lean() as PopulatedEnrollment[]

  const eligible = enrollments.filter(
    (e) => e.user_id?.whatsapp_number && typeof e.user_id.whatsapp_number === 'string'
  )

  if (eligible.length === 0) return { sent: 0, skipped: 0 }

  // Find who already submitted today
  const userIds = eligible.map((e) => e.user_id._id)
  const submittedToday = await UserTask.distinct('user_id', {
    user_id: { $in: userIds },
    submitted_at: { $gte: today },
  })
  const submittedSet = new Set(submittedToday.map(String))

  let sent = 0
  let skipped = 0

  for (const enrollment of eligible) {
    const userId = enrollment.user_id._id.toString()

    if (submittedSet.has(userId)) {
      skipped++
      continue
    }

    const { full_name, whatsapp_number, streak_days } = enrollment.user_id
    const trackTitle = enrollment.track_id?.title ?? 'your track'
    const firstName = full_name.split(' ')[0]

    // Choose message: streak-at-risk (> 0 streak) or plain daily reminder
    const message = streak_days > 0
      ? templates.streakAtRisk(firstName, streak_days)
      : templates.dailyReminder(firstName, enrollment.current_day, trackTitle)

    const ok = await sendWhatsApp(whatsapp_number!, message)
    if (ok) sent++
    else skipped++
  }

  return { sent, skipped }
}

/**
 * Send streak milestone messages (7, 14, 30, 60, 100 days).
 * Call this once per day after processing task submissions.
 */
export async function sendStreakMilestones(): Promise<{ sent: number }> {
  await connectDB()

  const MILESTONES = [7, 14, 30, 60, 100]

  const profiles = await Profile.find({
    streak_days: { $in: MILESTONES },
    whatsapp_number: { $exists: true, $ne: '' },
  })
    .select('full_name whatsapp_number streak_days')
    .lean()

  let sent = 0
  for (const profile of profiles) {
    if (!profile.whatsapp_number) continue
    const firstName = profile.full_name.split(' ')[0]
    const ok = await sendWhatsApp(
      profile.whatsapp_number,
      templates.streakMilestone(firstName, profile.streak_days)
    )
    if (ok) sent++
  }

  return { sent }
}

/* ─── per-event notifiers (called from API routes) ─────────── */

export async function notifyGigPaid(
  userId: string,
  amountNaira: number,
  gigTitle: string
): Promise<void> {
  try {
    await connectDB()
    const profile = await Profile.findById(userId)
      .select('full_name whatsapp_number')
      .lean()

    if (!profile?.whatsapp_number) return

    const firstName = profile.full_name.split(' ')[0]
    await sendWhatsApp(
      profile.whatsapp_number,
      templates.gigPaid(firstName, amountNaira, gigTitle)
    )
  } catch (err) {
    console.error('[WhatsApp] notifyGigPaid error:', err)
  }
}

export async function notifyWithdrawalProcessing(withdrawalId: string): Promise<void> {
  try {
    await connectDB()
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate<{ user_id: { full_name: string; whatsapp_number?: string } }>(
        'user_id',
        'full_name whatsapp_number'
      )
      .lean()

    if (!withdrawal) return
    const user = withdrawal.user_id as { full_name: string; whatsapp_number?: string }
    if (!user?.whatsapp_number) return

    const firstName = user.full_name.split(' ')[0]
    await sendWhatsApp(
      user.whatsapp_number,
      templates.withdrawalProcessing(firstName, withdrawal.amount_naira)
    )
  } catch (err) {
    console.error('[WhatsApp] notifyWithdrawalProcessing error:', err)
  }
}

export async function notifyWithdrawalCompleted(
  withdrawalId: string,
  status: 'completed' | 'failed',
  failureReason?: string
): Promise<void> {
  try {
    await connectDB()
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate<{ user_id: { full_name: string; whatsapp_number?: string } }>(
        'user_id',
        'full_name whatsapp_number'
      )
      .lean()

    if (!withdrawal) return
    const user = withdrawal.user_id as { full_name: string; whatsapp_number?: string }
    if (!user?.whatsapp_number) return

    const firstName = user.full_name.split(' ')[0]
    const message =
      status === 'completed'
        ? templates.withdrawalCompleted(firstName, withdrawal.amount_naira, withdrawal.bank_name)
        : templates.withdrawalFailed(firstName, withdrawal.amount_naira, failureReason ?? 'transfer failed')

    await sendWhatsApp(user.whatsapp_number, message)
  } catch (err) {
    console.error('[WhatsApp] notifyWithdrawalCompleted error:', err)
  }
}

export async function notifyTrackCompleted(userId: string, trackTitle: string): Promise<void> {
  try {
    await connectDB()
    const profile = await Profile.findById(userId)
      .select('full_name whatsapp_number')
      .lean()

    if (!profile?.whatsapp_number) return

    const firstName = profile.full_name.split(' ')[0]
    await sendWhatsApp(
      profile.whatsapp_number,
      templates.trackCompleted(firstName, trackTitle)
    )
  } catch (err) {
    console.error('[WhatsApp] notifyTrackCompleted error:', err)
  }
}
