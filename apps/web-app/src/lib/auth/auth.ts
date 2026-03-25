import axios from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface LoginResponse {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  organizationIds: number[];
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
              organizationIds: user.organizationIds,
              organizationId: user.organizationIds[0] ?? 0,
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
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? '';
        token.organizationIds = user.organizationIds;
        token.organizationId = user.organizationId;
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId);
        session.user.organizationIds = token.organizationIds as number[];
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
