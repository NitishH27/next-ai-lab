import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";
import type { ProfileValues } from "../profile.ts";
import {
  readProfile,
  upsertProfile,
  type ProfileCollection,
} from "./profiles-core.ts";

const empty: ProfileValues = {
  headline: null,
  location: null,
  websiteUrl: null,
  linkedinUrl: null,
};

type FakeDoc = Record<string, unknown> & { userId: ObjectId };

function createFakeCollection(options: { failFirstUpdate?: boolean } = {}) {
  const docs = new Map<string, FakeDoc>();
  let updates = 0;

  const collection: ProfileCollection = {
    async findOne(filter) {
      return docs.get(filter.userId.toHexString()) ?? null;
    },
    async updateOne(filter, update, updateOptions) {
      updates += 1;

      if (options.failFirstUpdate && updates === 1) {
        throw Object.assign(new Error("duplicate key"), { code: 11000 });
      }

      const key = filter.userId.toHexString();
      const existing = docs.get(key);

      if (existing) {
        docs.set(key, { ...existing, ...update.$set });
      } else if (updateOptions.upsert) {
        docs.set(key, {
          ...update.$setOnInsert,
          ...update.$set,
        } as FakeDoc);
      }

      return { acknowledged: true };
    },
  };

  return {
    collection,
    docs,
    updateCount: () => updates,
  };
}

test("reading a missing profile does not write", async () => {
  const fake = createFakeCollection();
  const userId = new ObjectId().toHexString();

  assert.equal(await readProfile(fake.collection, userId), null);
  assert.equal(fake.updateCount(), 0);
  assert.equal(fake.docs.size, 0);
});

test("a name-only first save lazily creates one profile with null optional fields", async () => {
  const fake = createFakeCollection();
  const userId = new ObjectId().toHexString();
  const now = new Date("2026-11-09T00:00:00.000Z");

  const saved = await upsertProfile(fake.collection, userId, empty, now);

  assert.ok(saved);
  assert.equal(saved.headline, null);
  assert.equal(saved.location, null);
  assert.equal(saved.websiteUrl, null);
  assert.equal(saved.linkedinUrl, null);
  assert.equal(saved.createdAt.toISOString(), now.toISOString());
  assert.equal(saved.updatedAt.toISOString(), now.toISOString());
  assert.equal(fake.docs.size, 1);
  assert.equal(fake.docs.get(userId)?.userId.toHexString(), userId);
});

test("a partial update changes fields and updatedAt but keeps createdAt", async () => {
  const fake = createFakeCollection();
  const userId = new ObjectId().toHexString();
  const created = new Date("2026-11-01T00:00:00.000Z");
  const updated = new Date("2026-11-09T00:00:00.000Z");

  await upsertProfile(fake.collection, userId, { ...empty, headline: "First" }, created);
  const saved = await upsertProfile(
    fake.collection,
    userId,
    { ...empty, headline: "Second", location: "Berlin" },
    updated,
  );

  assert.ok(saved);
  assert.equal(saved.headline, "Second");
  assert.equal(saved.location, "Berlin");
  assert.equal(saved.createdAt.toISOString(), created.toISOString());
  assert.equal(saved.updatedAt.toISOString(), updated.toISOString());
  assert.equal(fake.docs.size, 1);
});

test("a duplicate-key error is retried once and still leaves one profile", async () => {
  const fake = createFakeCollection({ failFirstUpdate: true });
  const userId = new ObjectId().toHexString();
  const now = new Date("2026-11-09T00:00:00.000Z");

  const saved = await upsertProfile(fake.collection, userId, empty, now);

  assert.ok(saved);
  assert.equal(fake.updateCount(), 2);
  assert.equal(fake.docs.size, 1);
});

test("reads and writes stay scoped to the supplied userId", async () => {
  const fake = createFakeCollection();
  const userA = new ObjectId().toHexString();
  const userB = new ObjectId().toHexString();
  const stranger = new ObjectId().toHexString();
  const now = new Date("2026-11-09T00:00:00.000Z");

  await upsertProfile(fake.collection, userA, { ...empty, headline: "A" }, now);
  await upsertProfile(fake.collection, userB, { ...empty, headline: "B" }, now);

  assert.equal((await readProfile(fake.collection, userA))?.headline, "A");
  assert.equal((await readProfile(fake.collection, userB))?.headline, "B");
  assert.equal(await readProfile(fake.collection, stranger), null);
  assert.equal(fake.docs.size, 2);
});

test("an invalid user id returns not-found without writing", async () => {
  const fake = createFakeCollection();

  assert.equal(await readProfile(fake.collection, "not-an-object-id"), null);
  assert.equal(
    await upsertProfile(fake.collection, "not-an-object-id", empty, new Date()),
    null,
  );
  assert.equal(fake.updateCount(), 0);
});
