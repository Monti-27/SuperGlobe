import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      twitterHandle?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    twitterHandle?: string;
  }
}
