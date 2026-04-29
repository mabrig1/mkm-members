'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
]

const schema = z.object({
  full_name: z.string().min(3, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, 'Enter a valid Nigerian phone number'),
  same_whatsapp: z.boolean(),
  whatsapp_number: z.string().optional(),
  university: z.string().min(3, 'Enter your university name'),
  state: z.string().min(2, 'Select your state'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  referral_code: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-400']

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [serverError, setServerError] = useState('')

  const strength = getPasswordStrength(password)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { same_whatsapp: true },
  })

  const sameWhatsapp = watch('same_whatsapp')
  const phoneValue = watch('phone')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          whatsapp_number: data.same_whatsapp ? data.phone : data.whatsapp_number,
          university: data.university,
          state: data.state,
          password: data.password,
          referral_code: data.referral_code || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Registration failed. Try again.')
        return
      }

      // Auto-login after registration
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push('/onboarding')
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  const inputClass =
    'w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-colors'

  const labelClass = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5'

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Create your account</h2>
        <p className="text-zinc-500 text-sm mt-1">Start earning in 14 days. No experience needed.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full name */}
        <div>
          <label className={labelClass}>Full name</label>
          <input {...register('full_name')} placeholder="Chukwuemeka Obi" className={inputClass} />
          {errors.full_name && <p className="text-red-400 text-xs mt-1.5">{errors.full_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email address</label>
          <input {...register('email')} type="email" autoComplete="email" placeholder="you@unilag.edu.ng" className={inputClass} />
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone number</label>
          <input {...register('phone')} type="tel" placeholder="08012345678" className={inputClass} />
          {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none mb-2">
            <div className="relative">
              <input {...register('same_whatsapp')} type="checkbox" className="sr-only" />
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${sameWhatsapp ? 'bg-[#F5A623] border-[#F5A623]' : 'bg-transparent border-zinc-600'}`}>
                {sameWhatsapp && <Check size={11} className="text-black" strokeWidth={3} />}
              </div>
            </div>
            <span className="text-zinc-400 text-sm">WhatsApp is same as phone number</span>
          </label>
          {!sameWhatsapp && (
            <input
              {...register('whatsapp_number')}
              type="tel"
              placeholder="WhatsApp number"
              className={inputClass}
            />
          )}
        </div>

        {/* University */}
        <div>
          <label className={labelClass}>University</label>
          <input {...register('university')} placeholder="University of Lagos" className={inputClass} />
          {errors.university && <p className="text-red-400 text-xs mt-1.5">{errors.university.message}</p>}
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>State</label>
          <select {...register('state')} className={`${inputClass} appearance-none`} defaultValue="">
            <option value="" disabled className="bg-zinc-900">Select your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s} className="bg-zinc-900">{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-400 text-xs mt-1.5">{errors.state.message}</p>}
        </div>

        {/* Password with strength meter */}
        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className={`${inputClass} pr-11`}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-zinc-800'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500">{strengthLabel[strength]}</p>
            </div>
          )}
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Referral code */}
        <div>
          <label className={labelClass}>
            Referral code <span className="text-zinc-600 normal-case font-normal">(optional)</span>
          </label>
          <input {...register('referral_code')} placeholder="e.g. AB1C2D3E" className={inputClass} />
        </div>

        {/* Server error */}
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#F5A623] hover:bg-[#e09610] text-black font-bold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Creating account…' : 'Create Account — It\'s Free'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#F5A623] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
