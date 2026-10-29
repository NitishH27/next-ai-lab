import 'server-only';

import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { getDb } from '@/lib/db/connect';
import { getMongoClient } from '@/lib/db/client';
import { env } from '@/lib/env';

export const auth = betterAuth({
  database: mongodbAdapter(await getDb(), { client: await getMongoClient() }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds for DB record; cookie will be session cookie
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
    },
  },
  trustedOrigins: [
    env.BETTER_AUTH_URL,
    'http://localhost:3000',
  ],
});
