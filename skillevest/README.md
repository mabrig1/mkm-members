# SkillVest App

> Earn While You Learn — Nigerian university students earn real income through verified digital skills.

## Overview

SkillVest is a mobile-first web app that connects Nigerian university students to paid digital skill tracks and a live gig marketplace. Students complete daily tasks, get AI-graded feedback, and withdraw real earnings via Paystack.

## Features

- **Skill Tracks** — Structured learning paths (copywriting, design, video, social media, affiliate, data entry)
- **AI Grading** — Task submissions graded by Claude with rubric-based scoring and actionable feedback
- **Gig Marketplace** — Escrow-protected gigs posted by B2B clients; apply, deliver, get paid
- **Income Coach** — Claude-powered chat widget for earning advice tailored to each student's level
- **Wallet** — Paystack-integrated balance, Nigerian bank account withdrawals, transaction history
- **Leaderboard** — Weekly top earners ranked across the platform
- **Premium** — ₦1,500/month subscription for higher gig limits and verified badge

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB / Mongoose
- **Auth**: NextAuth v4 (JWT + credentials)
- **AI**: Anthropic SDK (claude-sonnet-4-6)
- **Payments**: Paystack
- **Styling**: Tailwind CSS v4

## Getting Started

```bash
cd skillevest
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ANTHROPIC_API_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```
