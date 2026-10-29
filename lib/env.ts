import 'server-only';

const required = ['MONGODB_URI', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const;

function getEnv() {
  const missing: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Check your .env file and .env.example.`,
    );
  }

  const mongoUser = process.env.MONGODB_USER?.trim();
  const mongoPassword = process.env.MONGODB_PASSWORD;

  if ((mongoUser && !mongoPassword) || (!mongoUser && mongoPassword)) {
    throw new Error(
      'MONGODB_USER and MONGODB_PASSWORD must be set together. Check your .env file and .env.example.',
    );
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI as string,
    MONGODB_DB: process.env.MONGODB_DB || 'jobflow',
    MONGODB_USER: mongoUser,
    MONGODB_PASSWORD: mongoPassword,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

export const env = getEnv();
