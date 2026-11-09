import { ObjectId } from 'mongodb';
import type { ProfileValues } from '../profile.ts';

export type StoredProfile = ProfileValues & {
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileCollection = {
  findOne(filter: { userId: ObjectId }): Promise<Record<string, unknown> | null>;
  updateOne(
    filter: { userId: ObjectId },
    update: {
      $set: Record<string, unknown>;
      $setOnInsert: Record<string, unknown>;
    },
    options: { upsert: boolean },
  ): Promise<unknown>;
};

function toObjectId(value: string): ObjectId | null {
  try {
    return ObjectId.isValid(value) ? new ObjectId(value) : null;
  } catch {
    return null;
  }
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000);
}

export async function readProfile(
  collection: ProfileCollection,
  userId: string,
): Promise<StoredProfile | null> {
  const uid = toObjectId(userId);
  if (!uid) return null;

  const doc = await collection.findOne({ userId: uid });
  return doc as StoredProfile | null;
}

export async function upsertProfile(
  collection: ProfileCollection,
  userId: string,
  values: ProfileValues,
  now = new Date(),
): Promise<StoredProfile | null> {
  const uid = toObjectId(userId);
  if (!uid) return null;

  const update = {
    $set: { ...values, updatedAt: now },
    $setOnInsert: { userId: uid, createdAt: now },
  };

  // A concurrent first save can lose the unique-index race; retry once so the
  // second attempt updates the row the other request inserted.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await collection.updateOne({ userId: uid }, update, { upsert: true });
      return readProfile(collection, userId);
    } catch (error) {
      if (attempt === 0 && isDuplicateKey(error)) continue;
      throw error;
    }
  }

  return null;
}
