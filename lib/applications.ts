export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type Application = {
  id: string;
  company: string;
  role: string;
  appliedAt: string;
  status: ApplicationStatus;
  statusChangedAt: string;
};

export type ApplicationSummary = {
  sent: number;
  counts: Record<ApplicationStatus, number>;
  positive: number;
  offers: number;
  rejected: number;
  awaiting: number;
  withdrawn: number;
  stale: number;
  resolved: number;
  responseRate: number | null;
};

export type WeeklyApplicationCount = {
  weekStart: string;
  label: string;
  applied: number;
  interview: number;
  rejected: number;
};

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const STALE_AFTER_DAYS = 14;
const TREND_WEEKS = 12;

const weekLabelFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function daysBefore(days: number, from: Date = new Date()): string {
  return new Date(from.getTime() - days * DAY_MS).toISOString();
}

function sample(
  id: string,
  company: string,
  role: string,
  daysAgo: number,
  status: ApplicationStatus,
): Application {
  const appliedAt = daysBefore(daysAgo);

  return {
    id,
    company,
    role,
    appliedAt,
    status,
    statusChangedAt: status === "applied" ? appliedAt : daysBefore(Math.max(daysAgo - 3, 0)),
  };
}

// Sample records only. Swap getApplications for real storage when the tracker lands.
// Dates are spread across the 12-week trend window while keeping the status mix fixed.
function createSampleApplications(): Application[] {
  return [
    sample("app-001", "Northwind Labs", "Frontend Engineer", 79, "applied"),
    sample("app-002", "Seafoam Studio", "Product Designer", 52, "applied"),
    sample("app-003", "Cobalt Systems", "React Developer", 26, "applied"),
    sample("app-004", "Harbor Analytics", "UI Engineer", 9, "applied"),
    sample("app-005", "Meridian Health", "Frontend Developer", 66, "screening"),
    sample("app-006", "Driftwood AI", "Design Engineer", 12, "screening"),
    sample("app-007", "Lumen Finance", "Senior Frontend Engineer", 40, "interview"),
    sample("app-008", "Beacon Robotics", "Product Engineer", 5, "offer"),
    sample("app-009", "Tidewater Media", "Web Developer", 72, "rejected"),
    sample("app-010", "Quartz Retail", "Frontend Developer", 34, "rejected"),
    sample("app-011", "Anchor Logistics", "UI Developer", 21, "rejected"),
    sample("app-012", "Palm & Pine", "Design Technologist", 3, "withdrawn"),
    sample("app-013", "Juniper Works", "Frontend Engineer", 75, "applied"),
    sample("app-014", "Ember Studio", "UI Developer", 45, "applied"),
    sample("app-015", "Cedar & Co", "Web Engineer", 63, "rejected"),
    sample("app-016", "Orbit Digital", "React Developer", 4, "rejected"),
    sample("app-017", "Willow Health", "Design Engineer", 68, "interview"),
    sample("app-018", "Slate Partners", "Frontend Engineer", 30, "interview"),
    sample("app-019", "Marlow Labs", "UI Engineer", 15, "interview"),
  ];
}

export function getApplications(): Application[] {
  return createSampleApplications();
}

export function summarizeApplications(
  applications: Application[],
  now: Date = new Date(),
): ApplicationSummary {
  const counts: Record<ApplicationStatus, number> = {
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };
  let stale = 0;

  for (const application of applications) {
    counts[application.status] += 1;

    if (
      application.status === "applied" &&
      Math.floor((now.getTime() - new Date(application.appliedAt).getTime()) / DAY_MS) >=
        STALE_AFTER_DAYS
    ) {
      stale += 1;
    }
  }

  const positive = counts.screening + counts.interview;
  const resolved = positive + counts.offer + counts.rejected;

  return {
    sent: applications.length,
    counts,
    positive,
    offers: counts.offer,
    rejected: counts.rejected,
    awaiting: counts.applied,
    withdrawn: counts.withdrawn,
    stale,
    resolved,
    responseRate: resolved === 0 ? null : Math.round(((positive + counts.offer) / resolved) * 100),
  };
}

export function getWeeklyApplicationCounts(
  applications: Application[],
  now: Date = new Date(),
  weeks: number = TREND_WEEKS,
): WeeklyApplicationCount[] {
  const nowTime = now.getTime();
  const bucketStarts = Array.from(
    { length: weeks },
    (_, index) => nowTime - (weeks - index) * WEEK_MS,
  );
  const counts = bucketStarts.map(() => ({ applied: 0, interview: 0, rejected: 0 }));

  for (const application of applications) {
    const appliedTime = new Date(application.appliedAt).getTime();

    if (Number.isNaN(appliedTime) || appliedTime > nowTime) {
      continue;
    }

    const weeksAgo = Math.floor((nowTime - appliedTime) / WEEK_MS);

    if (weeksAgo >= weeks) {
      continue;
    }

    if (
      application.status === "applied" ||
      application.status === "interview" ||
      application.status === "rejected"
    ) {
      counts[weeks - 1 - weeksAgo][application.status] += 1;
    }
  }

  return bucketStarts.map((start, index) => ({
    weekStart: new Date(start).toISOString(),
    label: weekLabelFormat.format(new Date(start)),
    ...counts[index],
  }));
}
