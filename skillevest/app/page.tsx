import Link from 'next/link'
import {
  BookOpen, Briefcase, Zap, Star, ChevronRight,
  CheckCircle, Shield, Clock, Users, TrendingUp, MessageCircle,
} from 'lucide-react'

/* ─── data ───────────────────────────────────────────────────── */
const STATS = [
  { value: '₦4.2M+', label: 'Paid out to students' },
  { value: '2,847', label: 'Active learners' },
  { value: '94%', label: 'Complete their first gig' },
]

const STEPS = [
  {
    icon: <BookOpen size={22} className="text-[#F5A623]" />,
    number: '01',
    title: 'Pick a skill track',
    desc: 'Choose from copywriting, design, social media, and more. All tracks are free to start.',
  },
  {
    icon: <Zap size={22} className="text-[#F5A623]" />,
    number: '02',
    title: 'Complete daily tasks',
    desc: 'One task per day. AI grades your work instantly and gives you detailed feedback.',
  },
  {
    icon: <Briefcase size={22} className="text-[#F5A623]" />,
    number: '03',
    title: 'Win gigs, get paid',
    desc: 'Apply for real client gigs posted by Nigerian brands. All payments are escrow-protected.',
  },
]

const TRACKS = [
  {
    title: 'Cold Email Copywriting',
    category: 'Copywriting',
    duration: '14 days',
    earning: '₦5,000–₦20,000/gig',
    difficulty: 'Beginner',
    slug: 'cold-email-copywriting',
    color: 'text-blue-400 bg-blue-400/10',
    dot: 'bg-blue-400',
    tags: ['Email', 'Freelance', 'Remote'],
  },
  {
    title: 'Canva Social Media Design',
    category: 'Design',
    duration: '14 days',
    earning: '₦3,000–₦15,000/gig',
    difficulty: 'Beginner',
    slug: 'canva-social-media-design',
    color: 'text-purple-400 bg-purple-400/10',
    dot: 'bg-purple-400',
    tags: ['Canva', 'Instagram', 'Branding'],
  },
]

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    school: 'UNILAG, 300L Mass Comm',
    amount: '₦38,000',
    period: 'in her first month',
    quote: 'I thought I needed years of experience to get paid online. SkillVest showed me I just needed the right skill and a portfolio. Landed my first gig on Day 12.',
    initials: 'AO',
    color: 'text-pink-400 bg-pink-400/10',
  },
  {
    name: 'Tunde Fashola',
    school: 'OAU, 200L Computer Science',
    amount: '₦62,500',
    period: 'across 4 gigs',
    quote: 'The AI feedback is incredible. It told me exactly why my cold emails weren\'t getting replies. Fixed it on Day 6. By Day 14, a brand replied and paid me ₦15,000 for a campaign.',
    initials: 'TF',
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    name: 'Chisom Eze',
    school: 'UNN, Final Year Business Admin',
    amount: '₦21,000',
    period: 'first gig ever',
    quote: 'I designed flyers as a side hustle before but never knew what to charge. The rate card task changed everything. Now I have a portfolio and actual clients.',
    initials: 'CE',
    color: 'text-purple-400 bg-purple-400/10',
  },
]

const FAQS = [
  {
    q: 'Is SkillVest really free to start?',
    a: 'Yes. Both tracks (Cold Email Copywriting and Canva Design) are completely free. You only pay ₦1,500/month for Premium, which gives you access to more gigs, priority support, and a verified badge — but it\'s optional.',
  },
  {
    q: 'How does payment work?',
    a: 'When a client posts a gig, their payment is held in escrow. Once you deliver and the client approves, the money hits your SkillVest wallet instantly. You can withdraw to any Nigerian bank account anytime (min ₦1,000).',
  },
  {
    q: 'What if the client doesn\'t approve my work?',
    a: 'You have a 48-hour review window. If there\'s a dispute, our admin team reviews the submission and can release escrow on your behalf if your work meets the brief.',
  },
  {
    q: 'Do I need a laptop?',
    a: 'For the Canva Design track, a phone works for most tasks (Canva has a great mobile app). For Cold Email Copywriting, all you need is any device with a browser and a free Google account.',
  },
  {
    q: 'How does AI grading work?',
    a: 'We use Claude (Anthropic\'s AI) to grade your submissions against a rubric. It gives you a score out of 100, specific strengths, and areas to improve. You can resubmit after feedback.',
  },
  {
    q: 'Can I do this alongside my studies?',
    a: 'Absolutely. Tasks are designed to take 30–60 minutes per day. Many of our top earners are final-year students who complete tasks between lectures.',
  },
]

const WEEKLY_PAYOUTS = [
  { week: 'Wk 1', pct: 17 },
  { week: 'Wk 2', pct: 29 },
  { week: 'Wk 3', pct: 40 },
  { week: 'Wk 4', pct: 54 },
  { week: 'Wk 5', pct: 63 },
  { week: 'Wk 6', pct: 82 },
  { week: 'Wk 7', pct: 100 },
]

/* ─── sub-components ─────────────────────────────────────────── */
function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <span className="text-white font-black text-xl tracking-tight">
          Skill<span className="text-[#F5A623]">Vest</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-zinc-400 hover:text-white text-sm font-semibold transition-colors">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-[#F5A623] hover:bg-[#e09610] text-black text-sm font-black px-4 py-2 rounded-xl transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  )
}

function EarningsChart() {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Platform Payouts</p>
          <p className="text-white font-black text-xl mt-0.5">Growing Every Week</p>
        </div>
        <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">+486%</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {WEEKLY_PAYOUTS.map((w) => (
          <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-gradient-to-t from-[#F5A623] to-[#fbbf24] rounded-t-md"
              style={{ height: `${w.pct}%`, minHeight: 4 }}
            />
            <span className="text-zinc-600 text-[9px] font-semibold">{w.week}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
        <span className="text-zinc-500 text-xs">7-week cumulative</span>
        <span className="text-[#F5A623] font-black text-sm">₦1.9M+ paid out</span>
      </div>
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <NavBar />

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="text-[#F5A623] text-xs font-bold">Nigeria&apos;s #1 Earn-While-You-Learn Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            Get Your First<br />
            <span className="text-[#F5A623]">Paycheck</span> in<br />
            14 Days
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
            Learn a digital skill. Get real gigs from Nigerian brands. Get paid —
            all while studying. No experience needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#F5A623] hover:bg-[#e09610] text-black font-black text-base px-8 py-4 rounded-2xl transition-colors"
            >
              Start for Free <ChevronRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl transition-colors"
            >
              See How It Works
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-10">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-[#F5A623] font-black text-2xl leading-none">{s.value}</p>
                <p className="text-zinc-500 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-zinc-800/50 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { icon: <Shield size={14} />, text: 'Escrow-protected payments' },
            { icon: <CheckCircle size={14} />, text: 'AI-graded assignments' },
            { icon: <Zap size={14} />, text: 'Real client gigs' },
            { icon: <Users size={14} />, text: '2,847+ students earning' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-zinc-500 text-xs font-semibold">
              <span className="text-[#F5A623]">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-black">Three steps to your first paycheck</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div key={step.number} className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
              <span className="absolute top-4 right-5 text-5xl font-black text-zinc-800/80 leading-none select-none">
                {step.number}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-3">Available Tracks</p>
          <h2 className="text-3xl sm:text-4xl font-black">Start earning in 14 days</h2>
          <p className="text-zinc-500 text-base mt-3 max-w-lg mx-auto">
            Both tracks are free. Both land you your first gig. Pick the one that excites you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {TRACKS.map(track => (
            <div key={track.slug} className="bg-[#111111] border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex flex-col gap-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${track.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${track.dot}`} />
                  {track.category}
                </span>
                <span className="text-zinc-500 text-xs font-semibold">{track.difficulty}</span>
              </div>

              <div>
                <h3 className="text-white font-black text-xl mb-1">{track.title}</h3>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {track.duration}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={11} /> {track.earning}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {track.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/register"
                className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-black text-sm rounded-xl py-3 text-center transition-colors mt-auto"
              >
                Enroll Free →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* EARNINGS CHART */}
      <section className="py-4 px-4 sm:px-6 max-w-lg mx-auto">
        <EarningsChart />
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-3">Student Stories</p>
          <h2 className="text-3xl sm:text-4xl font-black">Real students. Real earnings.</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className="text-[#F5A623] fill-[#F5A623]" />
                ))}
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-zinc-600 text-xs">{t.school}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[#F5A623] font-black text-sm">{t.amount}</p>
                  <p className="text-zinc-600 text-[10px]">{t.period}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-black">Questions? Answered.</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="bg-[#111111] border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-[#F5A623] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-sm mb-2">{q}</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-[#1a1400] to-[#111111] border border-[#F5A623]/20 rounded-3xl px-8 py-14">
          <p className="text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-4">Ready to start?</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Your first paycheck is<br />14 days away.
          </h2>
          <p className="text-zinc-400 text-base mb-8">
            Free to join. No credit card. No experience needed. Just show up daily.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#e09610] text-black font-black text-lg px-10 py-4 rounded-2xl transition-colors"
          >
            Create Free Account <ChevronRight size={20} />
          </Link>
          <p className="text-zinc-600 text-xs mt-4">Joined by 2,847 Nigerian students this year</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-white font-black text-xl">
                Skill<span className="text-[#F5A623]">Vest</span>
              </span>
              <p className="text-zinc-600 text-xs mt-1">Nigeria&apos;s earn-while-you-learn platform</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-500">
              <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
              <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
              <Link href="/gigs" className="hover:text-white transition-colors">Gigs</Link>
              <Link href="/tracks" className="hover:text-white transition-colors">Tracks</Link>
              <a href="mailto:hello@skillevest.ng" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-zinc-800/50">
            <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} SkillVest. All rights reserved.</p>
            <div className="flex gap-5 text-xs text-zinc-600">
              <Link href="#" className="hover:text-zinc-400">Privacy Policy</Link>
              <Link href="#" className="hover:text-zinc-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
