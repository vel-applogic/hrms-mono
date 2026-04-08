import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    isSuperAdmin: boolean;
    organisations: { id: number; name: string }[];
    organizationId: number;
    roles: string[];
    photoUrl: string | null;
  }

  interface Session {
    user: {
      id: string;
      isSuperAdmin: boolean;
      organisations: { id: number; name: string }[];
      organizationId: number;
      roles: string[];
      photoUrl: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    isSuperAdmin: boolean;
    organisations: { id: number; name: string }[];
    organizationId: number;
    roles: string[];
    photoUrl: string | null;
  }
}
