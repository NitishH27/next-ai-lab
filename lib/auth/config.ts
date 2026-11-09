import 'server-only';

import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import {
  sendSignInAlertEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '@/lib/auth/email';
import { shouldSendSignInAlert } from '@/lib/auth/email-templates';
import { getDb } from '@/lib/db/connect';
import { getMongoClient } from '@/lib/db/client';
import { env } from '@/lib/env';

function logEmailFailure(message: string, error: unknown) {
  if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
    console.error(`[auth] ${message} (status ${error.status})`);
    return;
  }

  const detail = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[auth] ${message} ${detail}`);
}

// Keep Better Auth's collection names aligned with PRD-005. The verification
// collection is intentionally singular; the others are plural.
const sharedAuthOptions: BetterAuthOptions = {
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
    afterEmailVerification: async (user) => {
      try {
        await sendWelcomeEmail({
          user,
          appUrl: env.BETTER_AUTH_URL,
        });
      } catch (error) {
        logEmailFailure('Welcome email failed.', error);
      }
    },
  },
  session: {
    modelName: 'sessions',
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session, context) => {
          try {
            if (!context) {
              return;
            }

            const activeSessions = await context.context.internalAdapter.listSessions(
              session.userId,
              { onlyActiveSessions: true },
            );

            if (!shouldSendSignInAlert(activeSessions.length)) {
              return;
            }

            const user = await context.context.internalAdapter.findUserById(session.userId);
            if (!user) {
              return;
            }

            await sendSignInAlertEmail({
              user,
              signedInAt: session.createdAt,
              userAgent: session.userAgent,
            });
          } catch (error) {
            logEmailFailure('Sign-in alert email failed.', error);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
};

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
