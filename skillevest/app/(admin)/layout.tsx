import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role

  if (!session || role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <span className="text-white font-black text-lg">
          Skill<span className="text-[#F5A623]">Vest</span>
          <span className="ml-2 text-[10px] font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Admin
          </span>
        </span>
        <span className="text-zinc-500 text-xs">{session.user?.email}</span>
      </div>
      {children}
    </div>
  )
}
