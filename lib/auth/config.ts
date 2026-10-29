import 'server-only';

import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { sendVerificationEmail } from '@/lib/auth/email';
import { getDb } from '@/lib/db/connect';
import { getMongoClient } from '@/lib/db/client';
import { env } from '@/lib/env';

// Keep Better Auth's collection names aligned with PRD-005. The verification
// collection is intentionally singular; the others are plural.
const sharedAuthOptions = {
  user: { modelName: 'users' },
  account: { modelName: 'accounts' },
  verification: { modelName: 'verification' },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendVerificationEmail,
  },
  session: {
    modelName: 'sessions',
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
} as const;

const getAuth = async () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return betterAuth({
      ...sharedAuthOptions,
      database: mongodbAdapter({} as never),
      secret: env.BETTER_AUTH_SECRET || 'build-time-secret',
      baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
      trustedOrigins: [env.BETTER_AUTH_URL || 'http://localhost:3000', 'http://localhost:3000'],
    });
  }

  try {
    const db = await getDb();
    const client = await getMongoClient();
    return betterAuth({
      ...sharedAuthOptions,
      database: mongodbAdapter(db, { client }),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      session: {
        ...sharedAuthOptions.session,
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
  } catch {
    return betterAuth({
      ...sharedAuthOptions,
      database: mongodbAdapter({} as never),
      secret: env.BETTER_AUTH_SECRET || 'build-time-secret',
      baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
    });
  }
};

export const auth = await getAuth();
