# SkillVest

Nigeria's earn-while-you-learn platform. Students learn a digital skill, complete AI-graded daily tasks, and win real paid gigs from Nigerian brands — all in 14 days.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | MongoDB + Mongoose v9 |
| Auth | NextAuth v4 (JWT, CredentialsProvider) |
| AI Grading | Anthropic SDK — `claude-sonnet-4-6` |
| Payments | Paystack (escrow, transfers, wallet) |
| Notifications | Meta Cloud API (WhatsApp templates) |
| Deployment | Vercel (with Cron) |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/mabrig1/mkm-members.git
cd mkm-members/skillevest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the `skillevest/` directory:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillevest

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-32-char-secret

ANTHROPIC_API_KEY=sk-ant-...

PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

NEXT_PUBLIC_APP_URL=http://localhost:3000

WHATSAPP_API_TOKEN=your-meta-access-token
WHATSAPP_PHONE_ID=your-phone-number-id

CRON_SECRET=any-random-string
```

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `PAYSTACK_SECRET_KEY` | dashboard.paystack.com → Settings → API Keys |
| `WHATSAPP_API_TOKEN` | Meta for Developers → your app → WhatsApp → Access Token |
| `WHATSAPP_PHONE_ID` | Meta for Developers → WhatsApp → Phone Number ID |
| `CRON_SECRET` | Any random string — authenticates the daily reminder endpoint |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed the database

```bash
npm run db:seed
```

Inserts (idempotent — safe to re-run):
- **2 tracks** with 14 tasks each (Cold Email Copywriting, Canva Social Media Design)
- **6 realistic Nigerian market gigs** under a platform client account

### 6. Create your admin account

Register at `/register`, then open your MongoDB client and run:

```js
db.profiles.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Then visit `/admin`.

---

## Project Structure

```
skillevest/
├── app/
│   ├── page.tsx                         # Landing page
│   ├── layout.tsx                       # Root layout + SessionProvider
│   ├── providers.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx            # 9-field form, 37 states, strength meter
│   │   └── onboarding/page.tsx          # 3-step goal + track wizard
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx           # Main dashboard + AI income coach
│   │   ├── tracks/page.tsx
│   │   ├── tracks/[trackId]/page.tsx
│   │   ├── tasks/[taskId]/page.tsx      # Task viewer + AI grading + score circle
│   │   ├── gigs/page.tsx
│   │   ├── gigs/[gigId]/page.tsx        # Apply / submit / approve flow
│   │   ├── wallet/page.tsx              # Balance, withdraw modal, tx history
│   │   ├── leaderboard/page.tsx         # Podium + ranked list + sticky rank card
│   │   └── profile/page.tsx            # XP bar, stats, referral, edit modal
│   ├── (admin)/
│   │   └── admin/page.tsx              # 5-tab admin dashboard
│   └── api/                            # 28 route handlers (see below)
├── components/
│   └── BottomNav.tsx                   # Fixed 5-tab mobile navigation
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── anthropic/grader.ts             # AI grading + income coach functions
│   ├── paystack/index.ts               # All Paystack API helpers
│   └── mongodb/
│       ├── connection.ts               # Singleton connection with hot-reload cache
│       ├── seed.ts                     # Full seed (tracks + tasks + gigs)
│       ├── seed-gigs.ts
│       └── models/                     # 12 Mongoose models
│           ├── Profile.ts
│           ├── Track.ts / Task.ts
│           ├── Enrollment.ts / UserTask.ts
│           ├── Gig.ts / GigApplication.ts
│           ├── Transaction.ts / Withdrawal.ts
│           ├── LeaderboardEntry.ts
│           ├── Notification.ts
│           └── B2BClient.ts
├── middleware.ts                       # JWT route protection
└── vercel.json                         # Cron: daily reminder at 21:00 WAT
```

---

## API Routes (28 total)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/onboarding` | User | Complete onboarding |
| GET | `/api/dashboard` | User | All dashboard data in one request |
| GET | `/api/tracks` | User | List published tracks |
| GET | `/api/tracks/[trackId]` | User | Track detail + tasks |
| POST | `/api/tracks/enroll` | User | Enroll in a track |
| GET | `/api/tasks/[taskId]` | User | Load task + upsert UserTask |
| POST | `/api/tasks/[taskId]` | User | Submit + AI grade + award XP |
| GET | `/api/gigs` | User | List open gigs |
| GET | `/api/gigs/[gigId]` | User | Gig detail |
| POST | `/api/gigs/apply` | User | Apply for a gig |
| POST | `/api/gigs/submit-work` | Worker | Submit deliverable |
| POST | `/api/gigs/approve` | Client | Approve + release escrow |
| GET | `/api/wallet` | User | Balance + paginated transactions |
| POST | `/api/wallet/withdraw` | User | Initiate withdrawal |
| GET | `/api/wallet/banks` | User | Paystack bank list |
| GET | `/api/wallet/resolve-account` | User | Verify account name |
| POST | `/api/payments/initialize` | User | Start Paystack payment |
| GET | `/api/payments/verify` | — | Paystack redirect callback |
| GET | `/api/leaderboard` | User | Filtered rankings |
| GET/PATCH | `/api/profile` | User | Profile data / update |
| POST | `/api/ai-coach` | User | AI income coach chat |
| POST | `/api/ai-grader` | User | Grade submission via Claude |
| GET | `/api/admin/stats` | Admin | Platform metrics |
| GET/PATCH | `/api/admin/users` | Admin | User list / role + suspend |
| GET/PATCH | `/api/admin/gigs` | Admin | Gig list / close + escrow release |
| GET/PATCH | `/api/admin/tracks` | Admin | Track list / publish toggle |
| GET/PATCH | `/api/admin/withdrawals` | Admin | Withdrawal queue / approve + reject |
| GET/POST | `/api/whatsapp/daily-reminder` | Cron | Streak reminder blast |

---

## Pages Reference

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page — hero, tracks, testimonials, FAQ |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/onboarding` | Auth | Goal + track selection wizard |
| `/dashboard` | Auth | Dashboard — earnings, tasks, gigs, AI coach |
| `/tracks` | Auth | Track marketplace |
| `/tracks/[trackId]` | Auth | Track detail + enroll |
| `/tasks/[taskId]` | Auth | Daily task + AI grading |
| `/gigs` | Auth | Gig marketplace |
| `/gigs/[gigId]` | Auth | Gig detail + apply / submit / approve |
| `/wallet` | Auth | Balance, withdraw, transaction history |
| `/leaderboard` | Auth | Weekly / monthly / all-time rankings |
| `/profile` | Auth | Profile, XP, referrals, settings |
| `/admin` | Admin | Platform admin dashboard |

---

## XP & Level System

| XP | Level | Role |
|---|---|---|
| 0 | 1 | Novice |
| 200 | 2 | Novice |
| 800 | 3 | Apprentice |
| 2,000 | 4 | Pro |
| 5,000 | 5 | Mentor |

Task submission: +50–150 XP. Gig approval: +150 XP.

---

## Escrow Flow

```
Client posts gig → payment intent held
Worker applies → client assigns
Worker submits deliverable (48h review window)
Client approves → wallet credited instantly
         OR
Admin overrides → releases escrow manually
```

Platform fee is stored as `platform_fee_naira` on each gig and deducted before the worker's wallet is credited.

---

## WhatsApp Streak Reminder

Fires daily via Vercel Cron at **18:00 UTC (21:00 WAT)**:

1. Finds users with `streak_days > 0`, `whatsapp_optin: true`, `phone` set
2. Excludes users who already submitted a task today
3. Sends a WhatsApp template (`daily_streak_reminder`) with first name, streak count, and direct task URL
4. Nigerian numbers are normalised: `08012345678` → `2348012345678`

Manual trigger:
```bash
curl -X POST https://your-domain.com/api/whatsapp/daily-reminder \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel — select the `skillevest/` subdirectory as root
3. Add all environment variables
4. Deploy — Vercel picks up `vercel.json` and schedules the cron

```bash
# Confirm build passes locally first
npm run build
```
