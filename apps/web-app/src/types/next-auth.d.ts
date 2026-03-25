import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    organizationIds: number[];
    organizationId: number;
    roles: string[];
  }

  interface Session {
    user: {
      id: string;
      organizationIds: number[];
      organizationId: number;
      roles: string[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    organizationIds: number[];
    organizationId: number;
    roles: string[];
  }
}
