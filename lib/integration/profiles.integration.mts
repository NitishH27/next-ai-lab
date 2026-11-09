import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test, { after, before } from "node:test";
import {
  MongoClient,
  ObjectId,
  type MongoClientOptions,
} from "mongodb";
import type { ProfileValues } from "../profile.ts";
import {
  readProfile,
  upsertProfile,
  type ProfileCollection,
} from "../repositories/profiles-core.ts";

for (const file of [".env.local", ".env"]) {
  const envPath = resolve(process.cwd(), file);
  if (existsSync(envPath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
  }
}

const uri = process.env.MONGODB_URI;
const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const dbName = "jobflow_test";
const collectionName = `profiles_integration_${process.pid}_${Date.now()}`;
const skip = uri ? false : "Set MONGODB_URI in .env.local to run integration tests.";

const empty: ProfileValues = {
  headline: null,
  location: null,
  websiteUrl: null,
  linkedinUrl: null,
};

let client: MongoClient | undefined;

function clientOptions(): MongoClientOptions {
  const options: MongoClientOptions = { serverSelectionTimeoutMS: 15000 };

  if (username && password) {
    options.auth = { username, password };
    options.authSource = "admin";
  }

  return options;
}

before(async () => {
  if (!uri) return;

  client = new MongoClient(uri, clientOptions());
  await client.connect();
  await client
    .db(dbName)
    .collection(collectionName)
    .createIndex({ userId: 1 }, { unique: true, name: "profiles_userId_unique" });
});

after(async () => {
  if (!client) return;

  await client.db(dbName).collection(collectionName).drop().catch(() => {});
  await client.close();
});

test("profile upserts write one document and keep createdAt", { skip }, async () => {
  assert.ok(client);
  const collection = client
    .db(dbName)
    .collection(collectionName) as unknown as ProfileCollection;
  const userId = new ObjectId();
  const created = new Date("2026-11-09T00:00:00.000Z");
  const updated = new Date("2026-11-09T00:00:01.000Z");

  const first = await upsertProfile(collection, userId.toHexString(), empty, created);
  assert.ok(first);
  assert.equal(first.headline, null);
  assert.equal(first.createdAt.toISOString(), created.toISOString());

  const second = await upsertProfile(
    collection,
    userId.toHexString(),
    { ...empty, headline: "Integration designer", location: "Berlin" },
    updated,
  );
  assert.ok(second);
  assert.equal(second.headline, "Integration designer");
  assert.equal(second.location, "Berlin");
  assert.equal(second.createdAt.toISOString(), created.toISOString());
  assert.equal(second.updatedAt.toISOString(), updated.toISOString());

  const read = await readProfile(collection, userId.toHexString());
  assert.equal(read?.headline, "Integration designer");
});

test("two concurrent first saves leave one document", { skip }, async () => {
  assert.ok(client);
  const raw = client.db(dbName).collection(collectionName);
  const collection = raw as unknown as ProfileCollection;
  const userId = new ObjectId();
  const now = new Date("2026-11-09T00:00:00.000Z");

  await Promise.all([
    upsertProfile(collection, userId.toHexString(), { ...empty, headline: "One" }, now),
    upsertProfile(collection, userId.toHexString(), { ...empty, headline: "Two" }, now),
  ]);

  assert.equal(await raw.countDocuments({ userId }), 1);
});
