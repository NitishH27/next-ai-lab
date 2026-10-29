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

  return {
    MONGODB_URI: process.env.MONGODB_URI as string,
    MONGODB_DB: process.env.MONGODB_DB || 'jobflow',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

export const env = getEnv();
