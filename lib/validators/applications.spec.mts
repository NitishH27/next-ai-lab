import assert from "node:assert/strict";
import test from "node:test";
import {
  ApplicationValidationError,
  assertAppliedAtNotFuture,
  createApplicationSchema,
  updateApplicationSchema,
} from "./applications.ts";

const now = new Date("2026-10-29T12:00:00.000Z");

test("accepts an appliedAt in the past or exactly now", () => {
  assert.doesNotThrow(() => assertAppliedAtNotFuture(now, now));
  assert.doesNotThrow(() =>
    assertAppliedAtNotFuture(new Date("2026-10-28T12:00:00.000Z"), now),
  );
});

test("rejects a future appliedAt", () => {
  assert.throws(
    () => assertAppliedAtNotFuture(new Date("2026-10-29T12:00:00.001Z"), now),
    ApplicationValidationError,
  );
});

test("rejects an invalid appliedAt", () => {
  assert.throws(
    () => assertAppliedAtNotFuture(new Date("not-a-date"), now),
    ApplicationValidationError,
  );
});

test("createApplicationSchema trims text and parses the applied date", () => {
  const parsed = createApplicationSchema.parse({
    company: "  Acme  ",
    role: "  Engineer  ",
    appliedAt: "2026-10-28T12:00:00.000Z",
  });

  assert.equal(parsed.company, "Acme");
  assert.equal(parsed.role, "Engineer");
  assert.ok(parsed.appliedAt instanceof Date);
  assert.equal(parsed.status, "applied");
});

test("createApplicationSchema rejects empty fields, bad dates, and bad statuses", () => {
  assert.equal(
    createApplicationSchema.safeParse({
      company: " ",
      role: "Engineer",
      appliedAt: "2026-10-28T12:00:00.000Z",
    }).success,
    false,
  );
  assert.equal(
    createApplicationSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      appliedAt: "not-a-date",
    }).success,
    false,
  );
  assert.equal(
    createApplicationSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      appliedAt: "2026-10-28T12:00:00.000Z",
      status: "pending",
    }).success,
    false,
  );
});

test("updateApplicationSchema accepts partial updates", () => {
  const parsed = updateApplicationSchema.parse({ status: "interview" });
  assert.equal(parsed.status, "interview");
  assert.equal(parsed.company, undefined);
});

test("updateApplicationSchema rejects an empty update", () => {
  assert.equal(updateApplicationSchema.safeParse({}).success, false);
});
