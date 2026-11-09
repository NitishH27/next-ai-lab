import 'server-only';

import { Collection, Document } from 'mongodb';
import type { DbApplication, DbProfile } from './types';
import { getDb } from './connect';

export async function getUsersCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('users');
}

export async function getSessionsCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('sessions');
}

export async function getAccountsCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('accounts');
}

export async function getVerificationsCollection(): Promise<Collection<Document>> {
  const db = await getDb();
  return db.collection('verification');
}

export async function getApplicationsCollection(): Promise<Collection<Omit<DbApplication, "_id">>> {
  const db = await getDb();
  return db.collection<Omit<DbApplication, "_id">>('applications');
}

export async function getProfilesCollection(): Promise<Collection<Omit<DbProfile, "_id">>> {
  const db = await getDb();
  return db.collection<Omit<DbProfile, "_id">>('profiles');
}
