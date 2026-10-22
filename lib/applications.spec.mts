import assert from "node:assert/strict";
import test from "node:test";
import {
  summarizeApplications,
  type Application,
  type ApplicationStatus,
} from "./applications.ts";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const DAY_MS = 86_400_000;

function application(status: ApplicationStatus, daysAgo = 1, id = "app"): Application {
  const appliedAt = new Date(NOW.getTime() - daysAgo * DAY_MS).toISOString();

  return {
    id,
    company: "Sample Co",
    role: "Engineer",
    appliedAt,
    status,
    statusChangedAt: appliedAt,
  };
}

test("an empty dataset reports zeros and no rate", () => {
  const summary = summarizeApplications([], NOW);

  assert.equal(summary.sent, 0);
  assert.equal(summary.positive, 0);
  assert.equal(summary.offers, 0);
  assert.equal(summary.rejected, 0);
  assert.equal(summary.awaiting, 0);
  assert.equal(summary.withdrawn, 0);
  assert.equal(summary.stale, 0);
  assert.equal(summary.resolved, 0);
  assert.equal(summary.responseRate, null);
});

test("only-awaiting applications keep the rate empty", () => {
  const summary = summarizeApplications(
    [application("applied", 2), application("applied", 20)],
    NOW,
  );

  assert.equal(summary.sent, 2);
  assert.equal(summary.awaiting, 2);
  assert.equal(summary.stale, 1);
  assert.equal(summary.resolved, 0);
  assert.equal(summary.responseRate, null);
});

test("mixed statuses produce the expected outcome counts", () => {
  const summary = summarizeApplications(
    [
      application("applied", 3, "a"),
      application("screening", 4, "b"),
      application("interview", 5, "c"),
      application("offer", 6, "d"),
      application("rejected", 7, "e"),
      application("rejected", 8, "f"),
      application("withdrawn", 9, "g"),
    ],
    NOW,
  );

  assert.equal(summary.sent, 7);
  assert.deepEqual(summary.counts, {
    applied: 1,
    screening: 1,
    interview: 1,
    offer: 1,
    rejected: 2,
    withdrawn: 1,
  });
  assert.equal(summary.positive, 2);
  assert.equal(summary.offers, 1);
  assert.equal(summary.awaiting, 1);
  assert.equal(summary.withdrawn, 1);
});

test("outcome counts plus withdrawn always add up to sent", () => {
  const summary = summarizeApplications(
    [
      application("applied", 30, "a"),
      application("screening", 9, "b"),
      application("interview", 8, "c"),
      application("offer", 7, "d"),
      application("rejected", 6, "e"),
      application("withdrawn", 5, "f"),
    ],
    NOW,
  );

  assert.equal(
    summary.positive + summary.offers + summary.rejected + summary.awaiting + summary.withdrawn,
    summary.sent,
  );
});

test("response rate excludes awaiting and withdrawn applications", () => {
  const summary = summarizeApplications(
    [
      application("applied", 2, "a"),
      application("withdrawn", 2, "b"),
      application("screening", 2, "c"),
      application("offer", 2, "d"),
      application("rejected", 2, "e"),
      application("rejected", 2, "f"),
    ],
    NOW,
  );

  assert.equal(summary.resolved, 4);
  assert.equal(summary.responseRate, 50);
});

test("a stale application is 14 whole days old, not 13", () => {
  const summary = summarizeApplications(
    [application("applied", 13, "a"), application("applied", 14, "b")],
    NOW,
  );

  assert.equal(summary.stale, 1);
  assert.equal(summary.awaiting, 2);
});

test("stale flagging ignores non-applied statuses", () => {
  const summary = summarizeApplications(
    [application("screening", 40, "a"), application("rejected", 40, "b")],
    NOW,
  );

  assert.equal(summary.stale, 0);
});
