import { getServerSession as nextAuthGetServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;
                    const res = await fetch(`${API_BASE_URL}/admin/login`, {
                        method: 'POST',
                        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
                        headers: { "Content-Type": "application/json" }
                    });
                    const data = await res.json();
                    if (res.ok && data.admin) {
                        return { id: data.admin.id, name: "Admin", email: data.admin.email, role: "admin", token: data.token };
                    }
                    return null;
                } catch { return null; }
            }
        })
    ],
    session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
    pages: { signIn: "/login", error: "/login" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) { token.role = user.role; token.accessToken = user.token; }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) { session.user.role = token.role; session.user.id = token.sub; session.accessToken = token.accessToken; }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "tanak-prabha-admin-secret-key-change-in-production-2026",
    debug: process.env.NODE_ENV === "development",
};

/**
 * Get the current session from NextAuth (server-side)
 */
export async function getServerSession() {
    return nextAuthGetServerSession(authOptions);
}

/**
 * Returns Authorization headers for server-side API calls from the session token
 */
export function getAuthHeaders(session) {
    if (!session?.accessToken) return {};
    return { Authorization: `Bearer ${session.accessToken}` };
}
