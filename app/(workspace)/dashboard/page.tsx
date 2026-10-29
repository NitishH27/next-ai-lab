import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { listApplications } from "@/lib/repositories/applications";
import { serializeApplication } from "@/lib/utils/serialization";
import {
  getWeeklyApplicationCounts,
  summarizeApplications,
} from "@/lib/applications";
import ApplicationSummary from "@/components/dashboard/ApplicationSummary";
import ApplicationTrendChart from "@/components/dashboard/ApplicationTrendChart";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const docs = await listApplications(session.user.id);
  const applications = docs.map((doc: Record<string, unknown>) => {
    const serialized = serializeApplication(doc);
    return {
      id: serialized.id,
      company: doc.company as string,
      role: doc.role as string,
      appliedAt: serialized.appliedAt,
      status: doc.status,
      statusChangedAt: serialized.statusChangedAt,
    };
  }) as Array<{
    id: string;
    company: string;
    role: string;
    appliedAt: string;
    status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
    statusChangedAt: string;
  }>;

  const summary = summarizeApplications(applications);
  const weekly = getWeeklyApplicationCounts(applications);
  const isEmpty = summary.sent === 0;

  return (
    <div className="dashboard-shell">
      <p className="dashboard-notice" role="note">
        {isEmpty ? "No applications yet. Application tracking is coming next." : null}
      </p>
      <ApplicationSummary summary={summary} />
      <ApplicationTrendChart data={weekly} />
    </div>
  );
}
