'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen, Briefcase,
  ArrowDownToLine, ChevronRight, ArrowLeft,
} from 'lucide-react'

const NAV = [
  { href: '/admin',              label: 'Overview',    icon: LayoutDashboard, exact: true },
  { href: '/admin/users',        label: 'Users',       icon: Users },
  { href: '/admin/tracks',       label: 'Tracks',      icon: BookOpen },
  { href: '/admin/gigs',         label: 'Gigs',        icon: Briefcase },
  { href: '/admin/withdrawals',  label: 'Withdrawals', icon: ArrowDownToLine },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-52 min-h-screen bg-[#111111] border-r border-zinc-800 flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-white font-black text-lg leading-none">
          Skill<span className="text-[#F5A623]">Vest</span>
        </p>
        <p className="text-zinc-500 text-xs mt-1 font-semibold uppercase tracking-wider">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-zinc-500 text-xs font-semibold hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800/60"
        >
          <ArrowLeft size={13} /> Back to App
        </Link>
      </div>
    </aside>
  )
}
