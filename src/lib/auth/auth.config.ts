import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = auth?.user?.role === 'admin';
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/admin/login';

      if (isOnAdmin && !isOnLogin) {
        if (isLoggedIn) return true;
        return false; // Redirects unauthenticated users to login page
      } else if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/admin', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as string;
        }
      }
      return session;
    },
  },
  providers: [], // Configured with Credentials in auth/index.ts
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
