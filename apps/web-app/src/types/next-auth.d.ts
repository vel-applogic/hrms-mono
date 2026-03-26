import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    organisations: { id: number; name: string }[];
    organizationId: number;
    roles: string[];
  }

  interface Session {
    user: {
      id: string;
      organisations: { id: number; name: string }[];
      organizationId: number;
      roles: string[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    organisations: { id: number; name: string }[];
    organizationId: number;
    roles: string[];
  }
}
