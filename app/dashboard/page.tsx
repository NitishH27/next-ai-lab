"use client";

import AuthRoute from "@/components/auth/AuthRoute";
import ApplicationSummary from "@/components/dashboard/ApplicationSummary";
import { getApplications, summarizeApplications } from "@/lib/applications";

function DashboardContent() {
  const summary = summarizeApplications(getApplications());
  const isEmpty = summary.sent === 0;

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <p className="eyebrow">JobFlow workspace</p>
          <h1 id="dashboard-title">Welcome to dashboard</h1>
        </header>
        <p className="dashboard-notice" role="note">
          {isEmpty
            ? "No applications yet. Application tracking is coming next."
            : "Sample data — not connected to your applications yet."}
        </p>
        <ApplicationSummary summary={summary} />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthRoute requireAuthentication>
      <DashboardContent />
    </AuthRoute>
  );
}
