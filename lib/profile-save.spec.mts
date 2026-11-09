import assert from "node:assert/strict";
import test from "node:test";
import {
  savePersonalDetails,
  type ProfileSaveDeps,
  type ProfileSaveInput,
} from "./profile-save.ts";
import type { ProfileValues } from "./profile.ts";
import type { StoredProfile } from "./repositories/profiles-core.ts";

const input: ProfileSaveInput = {
  name: "Ada Lovelace",
  headline: "Product designer",
  location: "",
  websiteUrl: "https://example.com",
  linkedinUrl: "",
};

function stored(values: ProfileValues): StoredProfile {
  return {
    ...values,
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    updatedAt: new Date("2026-11-09T00:00:00.000Z"),
  };
}

function deps(overrides: Partial<ProfileSaveDeps> = {}): ProfileSaveDeps {
  return {
    getSession: async () => ({ userId: "user-1", name: "Ada" }),
    saveProfile: async (_userId, values) => stored(values),
    updateUserName: async () => {},
    ...overrides,
  };
}

test("a full save normalizes the profile and updates the name", async () => {
  const nameCalls: string[] = [];
  const result = await savePersonalDetails(
    { ...input, name: "  Ada Lovelace  ", headline: "  Product designer  " },
    deps({
      updateUserName: async (name) => {
        nameCalls.push(name);
      },
    }),
  );

  assert.equal(result.status, "saved");
  if (result.status === "saved") {
    assert.equal(result.name, "Ada Lovelace");
    assert.deepEqual(
      {
        headline: result.profile.headline,
        location: result.profile.location,
        websiteUrl: result.profile.websiteUrl,
        linkedinUrl: result.profile.linkedinUrl,
      },
      {
        headline: "Product designer",
        location: null,
        websiteUrl: "https://example.com",
        linkedinUrl: null,
      },
    );
  }
  assert.deepEqual(nameCalls, ["Ada Lovelace"]);
});

test("a name failure keeps the saved profile fields and returns partial success", async () => {
  let savedValues: ProfileValues | undefined;
  const result = await savePersonalDetails(
    { ...input, headline: "Staff designer" },
    deps({
      saveProfile: async (_userId, values) => {
        savedValues = values;
        return stored(values);
      },
      updateUserName: async () => {
        throw new Error("auth secret detail");
      },
    }),
  );

  assert.equal(result.status, "partial");
  if (result.status === "partial") {
    assert.equal(result.profile.headline, "Staff designer");
    assert.equal(result.fieldErrors.name, "Your name could not be updated. Try again.");
  }
  assert.equal(savedValues?.headline, "Staff designer");
});

test("the name update is skipped when the trimmed name is unchanged", async () => {
  let nameUpdates = 0;
  const result = await savePersonalDetails(
    { ...input, name: "  Ada  ", headline: "Changed headline" },
    deps({
      updateUserName: async () => {
        nameUpdates += 1;
      },
    }),
  );

  assert.equal(result.status, "saved");
  assert.equal(nameUpdates, 0);
});

test("invalid input returns field errors without writing", async () => {
  let saves = 0;
  let nameUpdates = 0;
  const result = await savePersonalDetails(
    { ...input, name: "   ", websiteUrl: "not-a-url", linkedinUrl: "https://example.com" },
    deps({
      saveProfile: async (_userId, values) => {
        saves += 1;
        return stored(values);
      },
      updateUserName: async () => {
        nameUpdates += 1;
      },
    }),
  );

  assert.equal(result.status, "invalid");
  if (result.status === "invalid") {
    assert.ok(result.fieldErrors.name);
    assert.ok(result.fieldErrors.websiteUrl);
    assert.ok(result.fieldErrors.linkedinUrl);
  }
  assert.equal(saves, 0);
  assert.equal(nameUpdates, 0);
});

test("a missing session returns unauthorized without writing", async () => {
  let saves = 0;
  const result = await savePersonalDetails(
    input,
    deps({
      getSession: async () => null,
      saveProfile: async (_userId, values) => {
        saves += 1;
        return stored(values);
      },
    }),
  );

  assert.deepEqual(result, { status: "unauthorized" });
  assert.equal(saves, 0);
});

test("unexpected storage failures return a safe error message", async () => {
  const result = await savePersonalDetails(
    input,
    deps({
      saveProfile: async () => {
        throw new Error("mongo connection string");
      },
    }),
  );

  assert.equal(result.status, "error");
  if (result.status === "error") {
    assert.equal(result.formError, "We couldn't save your profile. Try again.");
    assert.doesNotMatch(result.formError, /mongo/i);
  }
});
