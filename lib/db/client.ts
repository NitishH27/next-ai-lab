import 'server-only';

import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '@/lib/constants/db';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export { clientPromise };
