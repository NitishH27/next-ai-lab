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

const DAY_MS = 86_400_000;
const STALE_AFTER_DAYS = 14;

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
function createSampleApplications(): Application[] {
  return [
    sample("app-001", "Northwind Labs", "Frontend Engineer", 16, "applied"),
    sample("app-002", "Seafoam Studio", "Product Designer", 30, "applied"),
    sample("app-003", "Cobalt Systems", "React Developer", 9, "applied"),
    sample("app-004", "Harbor Analytics", "UI Engineer", 13, "applied"),
    sample("app-005", "Meridian Health", "Frontend Developer", 5, "screening"),
    sample("app-006", "Driftwood AI", "Design Engineer", 7, "screening"),
    sample("app-007", "Lumen Finance", "Senior Frontend Engineer", 12, "interview"),
    sample("app-008", "Beacon Robotics", "Product Engineer", 20, "offer"),
    sample("app-009", "Tidewater Media", "Web Developer", 22, "rejected"),
    sample("app-010", "Quartz Retail", "Frontend Developer", 28, "rejected"),
    sample("app-011", "Anchor Logistics", "UI Developer", 35, "rejected"),
    sample("app-012", "Palm & Pine", "Design Technologist", 18, "withdrawn"),
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
