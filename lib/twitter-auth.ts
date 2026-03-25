import type { NextAuthOptions, Profile } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

type TwitterProfileShape = Profile & {
  screen_name?: unknown;
  data?: {
    username?: unknown;
  };
};

function getTwitterHandle(profile: Profile | undefined) {
  if (!profile) {
    return null;
  }

  const twitterProfile = profile as TwitterProfileShape;
  const handle = twitterProfile.screen_name || twitterProfile.data?.username;
  return typeof handle === 'string' ? handle.replace(/^@/, '').trim() : null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      const twitterHandle = getTwitterHandle(profile);
      if (twitterHandle) {
        token.twitterHandle = twitterHandle;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.twitterHandle === 'string') {
        session.user.twitterHandle = token.twitterHandle;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};
