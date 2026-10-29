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
const clientOptions: MongoClientOptions =
  MONGODB_USER && MONGODB_PASSWORD
    ? {
        auth: { username: MONGODB_USER, password: MONGODB_PASSWORD },
        authSource: 'admin',
      }
    : {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export { clientPromise };
