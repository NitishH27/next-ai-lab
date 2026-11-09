import 'server-only';

import { getProfilesCollection } from '@/lib/db/collections';
import type { ProfileValues } from '@/lib/profile';
import {
  readProfile,
  upsertProfile,
  type ProfileCollection,
  type StoredProfile,
} from './profiles-core';

export type { StoredProfile } from './profiles-core';

async function collection(): Promise<ProfileCollection> {
  return (await getProfilesCollection()) as unknown as ProfileCollection;
}

export async function getProfile(userId: string): Promise<StoredProfile | null> {
  return readProfile(await collection(), userId);
}

export async function saveProfile(
  userId: string,
  values: ProfileValues,
): Promise<StoredProfile | null> {
  return upsertProfile(await collection(), userId, values);
}
