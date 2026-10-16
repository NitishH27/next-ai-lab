"use client";

import AuthRoute from "@/components/auth/AuthRoute";

export default function DashboardPage() {
  return (
    <AuthRoute requireAuthentication>
      <main className="dashboard-page">
        <section className="dashboard-card" aria-labelledby="dashboard-title">
          <p className="eyebrow">JobFlow workspace</p>
          <h1 id="dashboard-title">Welcome to dashboard</h1>
          <p>Your applications and opportunities will appear here soon.</p>
        </section>
      </main>
    </AuthRoute>
  );
}
