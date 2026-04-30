import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb/connection'
import { Gig, Profile, Transaction, Notification } from '@/lib/mongodb/models'
import { generateReference } from '@/lib/paystack'
import { notifyGigPaid } from '@/lib/whatsapp/reminders'
import mongoose from 'mongoose'

async function awardXP(userId: string, xp: number) {
  const profile = await Profile.findByIdAndUpdate(userId, { $inc: { xp_points: xp } }, { new: true }).lean()
  if (!profile) return
  const newLevel = profile.xp_points >= 5000 ? 5 : profile.xp_points >= 2000 ? 4 : profile.xp_points >= 800 ? 3 : profile.xp_points >= 200 ? 2 : 1
  const newRole = newLevel >= 5 ? 'mentor' : newLevel >= 4 ? 'pro' : newLevel >= 3 ? 'apprentice' : 'novice'
  if (newLevel > profile.level) await Profile.findByIdAndUpdate(userId, { level: newLevel, role: newRole })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { gig_id, rating, review } = await request.json()

  if (!gig_id) return NextResponse.json({ error: 'gig_id is required' }, { status: 400 })

  await connectDB()

  const gig = await Gig.findById(gig_id).lean()
  if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 })

  const clientId =
    (gig.client_id as { _id?: mongoose.Types.ObjectId } | mongoose.Types.ObjectId)?._id?.toString() ??
    gig.client_id?.toString()

  if (clientId !== userId) {
    return NextResponse.json({ error: 'Only the client can approve this gig' }, { status: 403 })
  }
  if (gig.status !== 'submitted') {
    return NextResponse.json({ error: `Cannot approve a gig with status: ${gig.status}` }, { status: 409 })
  }
  if (!gig.assigned_to) {
    return NextResponse.json({ error: 'No worker assigned to this gig' }, { status: 400 })
  }

  const workerEarning = gig.budget_naira - (gig.platform_fee_naira ?? 0)
  const workerId = gig.assigned_to.toString()
  const reference = generateReference('GIG')

  // All DB writes in parallel
  await Promise.all([
    Gig.findByIdAndUpdate(gig_id, {
      status: 'approved',
      approved_at: new Date(),
      ...(rating ? { client_rating: rating } : {}),
      ...(review ? { client_review: review } : {}),
    }),
    Profile.findByIdAndUpdate(workerId, {
      $inc: { wallet_balance: workerEarning, total_earned: workerEarning },
    }),
    Transaction.create({
      user_id: gig.assigned_to,
      type: 'gig_earning',
      amount_naira: workerEarning,
      status: 'completed',
      reference,
      description: `Gig earnings: ${gig.title}`,
      metadata: { gig_id, client_id: userId },
    }),
    Notification.create({
      user_id: gig.assigned_to,
      title: '💰 Payment Released!',
      body: `₦${workerEarning.toLocaleString('en-NG')} has been added to your wallet for "${gig.title}". Great work!`,
      type: 'payment',
      action_url: '/wallet',
    }),
  ])

  // Award XP for completed gig
  await awardXP(workerId, 150)

  // Fire-and-forget WhatsApp notification
  notifyGigPaid(workerId, workerEarning, gig.title).catch(() => {})

  return NextResponse.json({ success: true, amount_released: workerEarning, reference })
}
