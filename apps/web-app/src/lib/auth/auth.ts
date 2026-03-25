import axios from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface LoginResponse {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
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
              role: user.role,
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
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId);
        session.user.role = String(token.role);
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
