const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://skillevest.ng'

export const templates = {
  dailyReminder(name: string, day: number, trackTitle: string): string {
    return (
      `Hi ${name}! 👋\n\n` +
      `Day *${day}* of your *${trackTitle}* track is waiting for you.\n\n` +
      `Complete today's task to keep your streak alive and stay on track to earn 💰\n\n` +
      `→ ${APP_URL}/dashboard`
    )
  },

  streakAtRisk(name: string, streak: number): string {
    return (
      `⚠️ *${name}, your ${streak}-day streak is about to break!*\n\n` +
      `You haven't completed today's task yet. Don't let your hard work reset.\n\n` +
      `Open the app now 👇\n→ ${APP_URL}/dashboard`
    )
  },

  streakMilestone(name: string, streak: number): string {
    const emoji = streak >= 30 ? '🏆' : streak >= 14 ? '🔥' : '⚡'
    return (
      `${emoji} *${streak}-day streak, ${name}!*\n\n` +
      `You've completed tasks ${streak} days in a row. That's the discipline that builds real income in Nigeria.\n\n` +
      `Keep going! 💪\n→ ${APP_URL}/dashboard`
    )
  },

  gigAvailable(name: string, category: string, gigTitle: string, budgetNaira: number): string {
    return (
      `🔥 *New ${category} gig posted, ${name}!*\n\n` +
      `"${gigTitle}"\n` +
      `Budget: *₦${budgetNaira.toLocaleString('en-NG')}*\n\n` +
      `Apply before someone else grabs it 👇\n→ ${APP_URL}/gigs`
    )
  },

  gigPaid(name: string, amountNaira: number, gigTitle: string): string {
    return (
      `💰 *You just got paid, ${name}!*\n\n` +
      `₦${amountNaira.toLocaleString('en-NG')} has been added to your SkillVest wallet for:\n` +
      `"${gigTitle}"\n\n` +
      `Withdraw anytime 👇\n→ ${APP_URL}/wallet`
    )
  },

  withdrawalProcessing(name: string, amountNaira: number): string {
    return (
      `⏳ *Withdrawal initiated, ${name}.*\n\n` +
      `₦${amountNaira.toLocaleString('en-NG')} is on its way to your bank account.\n\n` +
      `Expected: 1–3 business days. We'll notify you when it lands.`
    )
  },

  withdrawalCompleted(name: string, amountNaira: number, bankName: string): string {
    return (
      `✅ *Withdrawal successful, ${name}!*\n\n` +
      `₦${amountNaira.toLocaleString('en-NG')} has been sent to your *${bankName}* account.\n\n` +
      `Keep earning with SkillVest 💪\n→ ${APP_URL}/wallet`
    )
  },

  withdrawalFailed(name: string, amountNaira: number, reason: string): string {
    return (
      `❌ *Withdrawal failed, ${name}.*\n\n` +
      `Your ₦${amountNaira.toLocaleString('en-NG')} withdrawal could not be processed.\n` +
      `Reason: ${reason}\n\n` +
      `The funds have been returned to your wallet. Please try again 👇\n→ ${APP_URL}/wallet`
    )
  },

  trackCompleted(name: string, trackTitle: string): string {
    return (
      `🎓 *Congratulations, ${name}!*\n\n` +
      `You've completed the *${trackTitle}* track!\n\n` +
      `You're now verified in this skill. Check the Gig Marketplace for paid opportunities 👇\n` +
      `→ ${APP_URL}/gigs`
    )
  },
}
