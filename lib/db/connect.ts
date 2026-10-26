import 'server-only';

import { Db } from 'mongodb';
import { MONGODB_DB_NAME } from '@/lib/constants/db';
import { getMongoClient } from './client';

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}
