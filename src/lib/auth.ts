import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from './database'
import { User } from '@/models'
import { rateLimit, clearRateLimit } from './rate-limit'
import { logger } from './logger'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const rememberMe = credentials.rememberMe === 'true'

       
        const rateLimitResult = rateLimit(`login:${credentials.email}`, {
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000 
        })

        if (!rateLimitResult.success) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        try {
          await dbConnect()
          
          const user = await User.findOne({ 
            email: credentials.email 
          }).select('+password')

          if (!user) {
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password)

          if (!isPasswordValid) {
            return null
          }

          
          clearRateLimit(`login:${credentials.email}`)

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            rememberMe
          }
        } catch (error) {
          logger.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.avatar = user.avatar
        token.rememberMe = user.rememberMe
        
       
        if (user.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
        } else {
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 1 day
        }
      }
      
    
      if (trigger === 'update' && session) {
        token.name = session.name || token.name
        token.email = session.email || token.email
        token.avatar = session.avatar || token.avatar
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).user.id = token.sub!;
        (session as any).user.role = token.role as string;
        (session as any).user.avatar = (token.avatar as string) || undefined;
        (session as any).user.name = token.name as string;
        (session as any).user.email = token.email as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  }
}