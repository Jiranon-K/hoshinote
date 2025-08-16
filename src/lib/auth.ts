import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from './database'
import { User } from '@/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
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

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.avatar = user.avatar
      }
      
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name || token.name
        token.email = session.email || token.email
        token.avatar = session.avatar || token.avatar
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.avatar = token.avatar as string || null
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  }
}