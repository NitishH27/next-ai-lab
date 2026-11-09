import assert from "node:assert/strict";
import test from "node:test";
import {
  formatMemberSince,
  getEmailVerificationState,
  getInitials,
  isProfileDirty,
  toFormValues,
  toProfileView,
  type ProfileValues,
} from "./profile.ts";

const profile: ProfileValues = {
  headline: "Product designer",
  location: "Berlin",
  websiteUrl: "https://example.com",
  linkedinUrl: "https://www.linkedin.com/in/ada",
};

test("getInitials handles empty, single-word, and multi-word labels", () => {
  assert.equal(getInitials(""), "A");
  assert.equal(getInitials("   "), "A");
  assert.equal(getInitials("Ada"), "AD");
  assert.equal(getInitials("Ada Lovelace"), "AL");
  assert.equal(getInitials("  Ada   King   Lovelace  "), "AL");
});

test("formatMemberSince formats the month and year in UTC", () => {
  assert.equal(formatMemberSince("2026-11-01T00:30:00.000Z"), "Nov 2026");
  assert.equal(formatMemberSince("2026-10-31T23:30:00.000Z"), "Oct 2026");
});

test("getEmailVerificationState treats missing values as unverified", () => {
  assert.equal(getEmailVerificationState(true), "verified");
  assert.equal(getEmailVerificationState(false), "unverified");
  assert.equal(getEmailVerificationState(null), "unverified");
  assert.equal(getEmailVerificationState(undefined), "unverified");
});

test("toProfileView serializes only the public profile fields", () => {
  const doc = {
    _id: "profile-id",
    userId: "user-id",
    ...profile,
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    updatedAt: new Date("2026-11-02T00:00:00.000Z"),
  };

  const view = toProfileView(doc);

  assert.deepEqual(view, {
    ...profile,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-02T00:00:00.000Z",
  });
  assert.equal("_id" in view, false);
  assert.equal("userId" in view, false);
});

test("toFormValues renders missing optional values as empty strings", () => {
  assert.deepEqual(toFormValues("Ada", null), {
    name: "Ada",
    headline: "",
    location: "",
    websiteUrl: "",
    linkedinUrl: "",
  });
  assert.deepEqual(toFormValues("Ada", profile), {
    name: "Ada",
    ...profile,
  });
});

test("isProfileDirty compares trimmed values against the baseline", () => {
  const baseline = toFormValues("Ada", profile);

  assert.equal(isProfileDirty(baseline, baseline), false);
  assert.equal(
    isProfileDirty({ ...baseline, name: "  Ada  ", headline: " Product designer " }, baseline),
    false,
  );
  assert.equal(isProfileDirty({ ...baseline, name: "Ada Lovelace" }, baseline), true);
  assert.equal(isProfileDirty({ ...baseline, location: "" }, baseline), true);
});
