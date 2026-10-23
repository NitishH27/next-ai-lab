import assert from "node:assert/strict";
import test from "node:test";
import {
  getApplications,
  getWeeklyApplicationCounts,
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

function applicationAt(status: ApplicationStatus, msAgo: number, id = "app"): Application {
  const appliedAt = new Date(NOW.getTime() - msAgo).toISOString();

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

test("weekly counts return twelve ordered buckets ending today", () => {
  const weeks = getWeeklyApplicationCounts([], NOW);

  assert.equal(weeks.length, 12);
  assert.equal(weeks[0].weekStart, new Date(NOW.getTime() - 84 * DAY_MS).toISOString());
  assert.equal(weeks[11].weekStart, new Date(NOW.getTime() - 7 * DAY_MS).toISOString());
  assert.match(weeks[0].label, /^[A-Z][a-z]{2} \d{1,2}$/);
  assert.ok(
    weeks.every((week) => week.applied === 0 && week.rejected === 0 && week.interview === 0),
  );
});

test("weekly counts bucket by trailing seven-day windows", () => {
  const weeks = getWeeklyApplicationCounts(
    [
      applicationAt("applied", 0, "now"),
      applicationAt("rejected", 7 * DAY_MS - 1, "inside-current"),
      applicationAt("interview", 7 * DAY_MS, "boundary"),
      applicationAt("applied", 84 * DAY_MS - 1, "oldest"),
      applicationAt("rejected", 84 * DAY_MS, "too-old"),
    ],
    NOW,
  );

  assert.equal(weeks[11].applied, 1);
  assert.equal(weeks[11].rejected, 1);
  assert.equal(weeks[10].interview, 1);
  assert.equal(weeks[0].applied, 1);
  assert.equal(
    weeks.reduce((total, week) => total + week.applied + week.rejected + week.interview, 0),
    4,
  );
});

test("weekly counts ignore future applications", () => {
  const weeks = getWeeklyApplicationCounts(
    [applicationAt("applied", 0, "now"), applicationAt("rejected", -DAY_MS, "future")],
    NOW,
  );

  assert.equal(
    weeks.reduce((total, week) => total + week.applied + week.rejected + week.interview, 0),
    1,
  );
});

test("weekly counts aggregate several applications per status in one week", () => {
  const weeks = getWeeklyApplicationCounts(
    [
      applicationAt("applied", 1 * DAY_MS, "a"),
      applicationAt("applied", 2 * DAY_MS, "b"),
      applicationAt("rejected", 3 * DAY_MS, "c"),
      applicationAt("interview", 6 * DAY_MS, "d"),
    ],
    NOW,
  );

  assert.equal(weeks[11].applied, 2);
  assert.equal(weeks[11].rejected, 1);
  assert.equal(weeks[11].interview, 1);
});

test("the sample records span the trend window", () => {
  const applications = getApplications();
  const now = new Date();
  const weeks = getWeeklyApplicationCounts(applications, now);

  assert.equal(weeks.length, 12);
  assert.deepEqual(
    weeks.map((week) => week.applied),
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0],
  );
  assert.deepEqual(
    weeks.map((week) => week.rejected),
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
  );
  assert.deepEqual(
    weeks.map((week) => week.interview),
    [0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0],
  );
});
