import assert from "node:assert/strict";
import test from "node:test";
import {
  isLinkedInUrl,
  parseHttpUrl,
  personalDetailsSchema,
} from "./profile.ts";

const base = {
  name: "Ada Lovelace",
  headline: "",
  location: "",
  websiteUrl: "",
  linkedinUrl: "",
};

test("personalDetailsSchema trims values and converts empty optional fields to null", () => {
  const parsed = personalDetailsSchema.parse({
    ...base,
    name: "  Ada Lovelace  ",
    headline: "  Product designer  ",
    location: "   ",
    websiteUrl: "",
    linkedinUrl: "  ",
  });

  assert.deepEqual(parsed, {
    name: "Ada Lovelace",
    headline: "Product designer",
    location: null,
    websiteUrl: null,
    linkedinUrl: null,
  });
});

test("personalDetailsSchema enforces the required name and text limits", () => {
  assert.equal(personalDetailsSchema.safeParse({ ...base, name: "   " }).success, false);
  assert.equal(
    personalDetailsSchema.safeParse({ ...base, name: "a".repeat(200) }).success,
    true,
  );
  assert.equal(
    personalDetailsSchema.safeParse({ ...base, name: "a".repeat(201) }).success,
    false,
  );
  assert.equal(
    personalDetailsSchema.safeParse({ ...base, headline: "a".repeat(120) }).success,
    true,
  );
  assert.equal(
    personalDetailsSchema.safeParse({ ...base, headline: "a".repeat(121) }).success,
    false,
  );
  assert.equal(
    personalDetailsSchema.safeParse({ ...base, location: "a".repeat(121) }).success,
    false,
  );
});

test("website URLs must be absolute HTTP or HTTPS URLs", () => {
  for (const value of [
    "https://example.com",
    "http://example.com/path?q=1",
    "https://EXAMPLE.com",
  ]) {
    assert.equal(
      personalDetailsSchema.safeParse({ ...base, websiteUrl: value }).success,
      true,
      value,
    );
  }

  for (const value of [
    "example.com",
    "/profile",
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://user:pass@example.com",
    "https://example.com:8443",
    "https://example.com.",
    "not a url",
  ]) {
    assert.equal(
      personalDetailsSchema.safeParse({ ...base, websiteUrl: value }).success,
      false,
      value,
    );
  }
});

test("website URLs store the trimmed value as entered", () => {
  const parsed = personalDetailsSchema.parse({
    ...base,
    websiteUrl: "  https://EXAMPLE.com/Path  ",
  });

  assert.equal(parsed.websiteUrl, "https://EXAMPLE.com/Path");
});

test("LinkedIn URLs accept linkedin.com and its subdomains only", () => {
  for (const value of [
    "https://linkedin.com/in/ada",
    "https://www.linkedin.com/in/ada",
    "https://jobs.linkedin.com/",
    "https://WWW.LINKEDIN.COM/in/ada",
  ]) {
    assert.equal(isLinkedInUrl(value), true, value);
    assert.equal(
      personalDetailsSchema.safeParse({ ...base, linkedinUrl: value }).success,
      true,
      value,
    );
  }

  for (const value of [
    "https://linkedin.com.evil.com/in/ada",
    "https://evil-linkedin.com/in/ada",
    "https://linkedin.com.",
    "https://example.com/in/ada",
    "linkedin.com/in/ada",
  ]) {
    assert.equal(isLinkedInUrl(value), false, value);
    assert.equal(
      personalDetailsSchema.safeParse({ ...base, linkedinUrl: value }).success,
      false,
      value,
    );
  }
});

test("parseHttpUrl rejects credentials, non-default ports, and trailing-dot hosts", () => {
  assert.ok(parseHttpUrl("https://example.com"));
  assert.ok(parseHttpUrl("https://example.com:443"));
  assert.ok(parseHttpUrl("http://example.com:80"));
  assert.equal(parseHttpUrl("ftp://example.com"), null);
  assert.equal(parseHttpUrl("https://user@example.com"), null);
  assert.equal(parseHttpUrl("https://example.com:8443"), null);
  assert.equal(parseHttpUrl("https://example.com."), null);
});

test("server-owned fields are rejected", () => {
  for (const field of ["_id", "userId", "email", "createdAt", "updatedAt"]) {
    assert.equal(
      personalDetailsSchema.safeParse({ ...base, [field]: "client-value" }).success,
      false,
      field,
    );
  }
});
