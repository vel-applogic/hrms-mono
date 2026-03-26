import axios from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface LoginResponse {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  isSuperAdmin: boolean;
  organisations: { id: number; name: string }[];
  roles: string[];
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post<LoginResponse>(`${process.env.BACKEND_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const user = response.data;
          if (user) {
            return {
              id: String(user.id),
              email: user.email,
              name: `${user.firstname} ${user.lastname}`,
              isSuperAdmin: user.isSuperAdmin,
              organisations: user.organisations,
              organizationId: user.organisations[0]?.id ?? 0,
              roles: user.roles,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id ?? '';
        token.isSuperAdmin = user.isSuperAdmin;
        token.organisations = user.organisations;
        token.organizationId = user.organizationId;
        token.roles = user.roles;
      }
      if (trigger === 'update' && typeof session?.organizationId === 'number') {
        token.organizationId = session.organizationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId);
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
        session.user.organisations = token.organisations as { id: number; name: string }[];
        session.user.organizationId = token.organizationId as number;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
});
