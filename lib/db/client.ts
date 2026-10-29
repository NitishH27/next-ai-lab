import 'server-only';

import { MongoClient, type MongoClientOptions } from 'mongodb';
import {
  MONGODB_PASSWORD,
  MONGODB_URI,
  MONGODB_USER,
} from '@/lib/constants/db';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = MONGODB_URI;

// Pass credentials separately so characters such as @ in the password are not
// parsed as part of the connection string.
const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  ...(MONGODB_USER && MONGODB_PASSWORD
    ? {
        auth: { username: MONGODB_USER, password: MONGODB_PASSWORD },
        authSource: 'admin',
      }
    : {}),
};

let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NEXT_PHASE === 'phase-production-build' && (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')))) {
    clientPromise = Promise.reject(new Error('MongoDB URI not configured'));
    return clientPromise;
  }

  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('Invalid MongoDB URI');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, clientOptions);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, clientOptions);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export { getClientPromise as clientPromise };
