import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (typeof credentials?.username !== 'string' || typeof credentials?.password !== 'string') {
          return null;
        }

        const username = credentials.username.trim();
        const password = credentials.password;
        if (!username || username.length > 100 || !password || password.length > 1024) return null;

        const user = db.select().from(users).where(eq(users.username, username)).get();
        if (!user || user.role !== 'admin') {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.displayName || user.username,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
});
