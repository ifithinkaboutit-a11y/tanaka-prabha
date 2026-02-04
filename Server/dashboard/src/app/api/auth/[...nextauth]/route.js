import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Admin users - In production, store these in a database
const adminUsers = [
  {
    id: "1",
    name: "Admin",
    email: "admin@tanakprabha.gov.in",
    // Password: admin123
    password: "admin123",
    role: "admin",
    avatar: "/avatars/admin.jpg"
  },
  {
    id: "2", 
    name: "Super Admin",
    email: "superadmin@tanakprabha.gov.in",
    // Password: admin123
    password: "admin123",
    role: "superadmin",
    avatar: "/avatars/superadmin.jpg"
  }
]

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@tanakprabha.gov.in" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = adminUsers.find(u => u.email === credentials.email)
          
          if (!user) {
            return null
          }

          // Simple password check (use bcrypt in production)
          if (credentials.password !== user.password) {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.avatar = token.avatar
        session.user.id = token.sub
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "tanak-prabha-admin-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
