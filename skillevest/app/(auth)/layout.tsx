export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Skill<span className="text-[#F5A623]">Vest</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            University gives you a certificate in 4 years.
            <br />
            We give you a paycheck in 14 days.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
