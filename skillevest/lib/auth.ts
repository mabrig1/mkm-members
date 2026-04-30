import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb/connection'
import Profile from '@/lib/mongodb/models/Profile'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()

        const profile = await Profile.findOne({ email: credentials.email.toLowerCase() })
          .select('+password_hash')
          .lean()

        if (!profile?.password_hash) return null

        const isValid = await bcrypt.compare(credentials.password, profile.password_hash)
        if (!isValid) return null

        return {
          id: profile._id.toString(),
          email: profile.email,
          name: profile.full_name,
          role: profile.role,
          onboarding_completed: profile.onboarding_completed,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.onboarding_completed = (user as { onboarding_completed?: boolean }).onboarding_completed
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id
        ;(session.user as Record<string, unknown>).role = token.role
        ;(session.user as Record<string, unknown>).onboarding_completed = token.onboarding_completed
      }
      return session
    },
  },
}
