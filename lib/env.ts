import 'server-only';

const required = ['MONGODB_URI', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'] as const;

let cachedEnv: {
  MONGODB_URI: string;
  MONGODB_DB: string;
  MONGODB_USER?: string;
  MONGODB_PASSWORD?: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  NODE_ENV: string;
} | null = null;

function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  const missing: string[] = [];

  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0 && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Check your .env file and .env.example.`,
    );
  }

  const mongoUser = process.env.MONGODB_USER?.trim();
  const mongoPassword = process.env.MONGODB_PASSWORD;
  const mongoDb = process.env.MONGODB_DB?.trim();

  if ((mongoUser && !mongoPassword) || (!mongoUser && mongoPassword)) {
    throw new Error(
      'MONGODB_USER and MONGODB_PASSWORD must be set together. Check your .env file and .env.example.',
    );
  }

  const allowedDbNames = [
    'jobflow_dev',
    'jobflow_test',
    'jobflow_preview',
    'jobflow_prod',
  ];
  const isDeployed = Boolean(process.env.VERCEL_ENV);

  if (isDeployed && process.env.NEXT_PHASE !== 'phase-production-build') {
    if (!mongoDb) {
      throw new Error(
        'MONGODB_DB must be set explicitly in deployed environments. Use jobflow_preview or jobflow_prod. Check your environment variables.',
      );
    }
    if (!allowedDbNames.includes(mongoDb)) {
      throw new Error(
        `MONGODB_DB must be one of ${allowedDbNames.join(', ')}. Check your environment variables.`,
      );
    }
  }

  cachedEnv = {
    MONGODB_URI: process.env.MONGODB_URI || '',
    MONGODB_DB: mongoDb || 'jobflow_dev',
    MONGODB_USER: mongoUser,
    MONGODB_PASSWORD: mongoPassword,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  return cachedEnv;
}

export const env = getEnv();
