
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      avatar?: string
    }
  }

  interface User {
    role: string
    avatar?: string
    rememberMe?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    avatar?: string
    rememberMe?: boolean
  }
}