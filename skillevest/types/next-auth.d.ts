import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'novice' | 'apprentice' | 'pro' | 'mentor' | 'admin'
      onboarding_completed: boolean
    }
  }

  interface User {
    id: string
    role: 'novice' | 'apprentice' | 'pro' | 'mentor' | 'admin'
    onboarding_completed: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'novice' | 'apprentice' | 'pro' | 'mentor' | 'admin'
    onboarding_completed: boolean
  }
}
