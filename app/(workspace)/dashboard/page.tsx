"use client";

import ApplicationSummary from "@/components/dashboard/ApplicationSummary";
import ApplicationTrendChart from "@/components/dashboard/ApplicationTrendChart";
import {
  getApplications,
  getWeeklyApplicationCounts,
  summarizeApplications,
} from "@/lib/applications";

export default function DashboardPage() {
  const applications = getApplications();
  const summary = summarizeApplications(applications);
  const weekly = getWeeklyApplicationCounts(applications);
  const isEmpty = summary.sent === 0;

  return (
    <div className="dashboard-shell">
      <p className="dashboard-notice" role="note">
        {isEmpty
          ? "No applications yet. Application tracking is coming next."
          : "Sample data — not connected to your applications yet."}
      </p>
      <ApplicationSummary summary={summary} />
      <ApplicationTrendChart data={weekly} />
    </div>
  );
}
