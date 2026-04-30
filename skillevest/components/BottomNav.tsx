'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Briefcase, Trophy, User } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/tracks', icon: BookOpen, label: 'Tracks' },
  { href: '/gigs', icon: Briefcase, label: 'Gigs' },
  { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-zinc-800">
      <div className="flex items-center justify-around px-2 py-2 pb-safe max-w-lg mx-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[44px] ${
                active ? 'text-[#F5A623]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className={`text-[10px] font-semibold ${active ? 'text-[#F5A623]' : 'text-zinc-600'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
