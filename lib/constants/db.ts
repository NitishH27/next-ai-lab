import 'server-only';

import { env } from '@/lib/env';

export const MONGODB_URI = env.MONGODB_URI;
export const MONGODB_DB_NAME = env.MONGODB_DB;
export const MONGODB_USER = env.MONGODB_USER;
export const MONGODB_PASSWORD = env.MONGODB_PASSWORD;
