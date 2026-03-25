import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@tanakprabha.org" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL;

          const res = await fetch(`${apiUrl}/admin/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" }
          })

          const data = await res.json()

          if (res.ok && data.admin) {
            return {
              id: data.admin.id,
              name: "Admin",
              email: data.admin.email,
              role: "admin",
              avatar: "/avatars/admin.jpg",
              token: data.token
            }
          }

          return null
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
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.avatar = token.avatar
        session.user.id = token.sub
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "tanak-prabha-admin-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
