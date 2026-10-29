import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

type IndexDefinition = {
  keys: Record<string, number>;
  options: Record<string, unknown>;
};

type FakeDb = {
  indexes: Map<string, Map<string, IndexDefinition>>;
  collection: (name: string) => {
    createIndex: (
      keys: Record<string, number>,
      options: Record<string, unknown> & { name: string },
    ) => Promise<string>;
  };
};

const require = createRequire(import.meta.url);
const migrationsDir = fileURLToPath(new URL("../../migrations", import.meta.url));

function createFakeDb(): FakeDb {
  const indexes = new Map<string, Map<string, IndexDefinition>>();

  return {
    indexes,
    collection(name) {
      const collectionIndexes = indexes.get(name) ?? new Map();
      indexes.set(name, collectionIndexes);

      return {
        async createIndex(keys, options) {
          collectionIndexes.set(options.name, { keys, options });
          return options.name;
        },
      };
    },
  };
}

test("migrations create the PRD-005 index set", async () => {
  const db = createFakeDb();
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js"))
    .sort();

  for (const file of files) {
    const migration = require(join(migrationsDir, file)) as {
      up: (db: FakeDb, client: unknown) => Promise<void>;
    };
    await migration.up(db, {});
  }

  const expectedIndexes = [
    ["users", "users_email_unique"],
    ["sessions", "sessions_token_unique"],
    ["sessions", "sessions_userId"],
    ["sessions", "sessions_expiresAt_ttl"],
    ["applications", "applications_user_applied_desc"],
    ["applications", "applications_user_status"],
    ["verification", "verification_identifier"],
    ["accounts", "accounts_userId"],
    ["accounts", "accounts_provider_account_unique"],
    ["verification", "verification_expiresAt_ttl"],
  ];

  for (const [collection, index] of expectedIndexes) {
    assert.ok(
      db.indexes.get(collection)?.has(index),
      `${collection}.${index} was not created`,
    );
  }

  assert.deepEqual(
    db.indexes.get("accounts")?.get("accounts_provider_account_unique"),
    {
      keys: { providerId: 1, accountId: 1 },
      options: {
        unique: true,
        name: "accounts_provider_account_unique",
      },
    },
  );
  assert.deepEqual(
    db.indexes.get("verification")?.get("verification_expiresAt_ttl"),
    {
      keys: { expiresAt: 1 },
      options: {
        expireAfterSeconds: 0,
        name: "verification_expiresAt_ttl",
      },
    },
  );
});
