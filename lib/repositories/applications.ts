import 'server-only';

import { ObjectId } from 'mongodb';
import { getApplicationsCollection } from '@/lib/db/collections';
import { ApplicationStatus } from '@/lib/applications';

function toObjectId(id: string): ObjectId | null {
  try {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function listApplications(userId: string) {
  const collection = await getApplicationsCollection();
  const uid = toObjectId(userId);
  if (!uid) return [];

  const docs = await collection
    .find({ userId: uid })
    .sort({ appliedAt: -1, _id: -1 })
    .toArray();

  return docs;
}

export async function createApplication(
  userId: string,
  data: { company: string; role: string; appliedAt: Date; status?: ApplicationStatus },
) {
  const collection = await getApplicationsCollection();
  const uid = toObjectId(userId);
  if (!uid) throw new Error('Invalid user');

  const now = new Date();
  const appliedAt = data.appliedAt > now ? now : data.appliedAt;
  const status = data.status || 'applied';

  const result = await collection.insertOne({
    userId: uid,
    company: data.company,
    role: data.role,
    appliedAt,
    status,
    statusChangedAt: appliedAt,
    createdAt: now,
    updatedAt: now,
  });

  const doc = await collection.findOne({ _id: result.insertedId, userId: uid });
  return doc;
}

export async function updateApplication(
  userId: string,
  id: string,
  updates: Partial<{ company: string; role: string; appliedAt: Date; status: ApplicationStatus }>,
) {
  const collection = await getApplicationsCollection();
  const uid = toObjectId(userId);
  const oid = toObjectId(id);
  if (!uid || !oid) return null;

  const existing = await collection.findOne({ _id: oid, userId: uid });
  if (!existing) return null;

  const now = new Date();
  const set: Record<string, unknown> = { updatedAt: now };

  if (updates.company !== undefined) set.company = updates.company;
  if (updates.role !== undefined) set.role = updates.role;
  if (updates.appliedAt !== undefined) {
    set.appliedAt = updates.appliedAt > now ? now : updates.appliedAt;
  }
  if (updates.status !== undefined && updates.status !== existing.status) {
    set.status = updates.status;
    set.statusChangedAt = now;
  }

  const updateDoc: { $set: Record<string, unknown> } = { $set: set };

  await collection.updateOne({ _id: oid, userId: uid }, updateDoc);
  const doc = await collection.findOne({ _id: oid, userId: uid });
  return doc;
}

export async function deleteApplication(userId: string, id: string) {
  const collection = await getApplicationsCollection();
  const uid = toObjectId(userId);
  const oid = toObjectId(id);
  if (!uid || !oid) return false;

  const result = await collection.deleteOne({ _id: oid, userId: uid });
  return result.deletedCount === 1;
}
