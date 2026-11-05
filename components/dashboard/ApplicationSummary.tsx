import Link from "next/link";
import type { ApplicationSummary } from "@/lib/applications";

const statusOrder = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
] as const;

export default function ApplicationSummary({ summary }: { summary: ApplicationSummary }) {
  const rate = summary.responseRate === null ? "—" : `${summary.responseRate}% of resolved`;
  const staleDetail =
    summary.stale === 0 ? "No follow-ups due" : `${summary.stale} need follow-up`;

  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 className="visually-hidden" id="summary-heading">
        Application status summary
      </h2>
      <ul className="summary-grid">
        <li className="summary-stat">
          <p className="summary-stat-label">Applications sent</p>
          <p className="summary-stat-value">{summary.sent}</p>
          <p className="summary-stat-detail">All time</p>
        </li>
        <li className="summary-stat">
          <p className="summary-stat-label">Positive responses</p>
          <p className="summary-stat-value">{summary.positive}</p>
          <p className="summary-stat-detail">{rate}</p>
        </li>
        <li className="summary-stat">
          <p className="summary-stat-label">Offers</p>
          <p className="summary-stat-value">{summary.offers}</p>
          <p className="summary-stat-detail">{rate}</p>
        </li>
        <li className="summary-stat">
          <p className="summary-stat-label">Rejected</p>
          <p className="summary-stat-value">{summary.rejected}</p>
          <p className="summary-stat-detail">
            {summary.rejected} of {summary.resolved} resolved
          </p>
        </li>
        <li className="summary-stat">
          <p className="summary-stat-label">Awaiting review</p>
          <p className="summary-stat-value">{summary.awaiting}</p>
          <p
            className={`summary-stat-detail${summary.stale > 0 ? " is-warning" : ""}`}
          >
            {staleDetail}
          </p>
        </li>
      </ul>
      {summary.sent === 0 ? (
        <p className="dashboard-empty">
          No applications yet.{" "}
          <Link href="/applications">Add your first application</Link>.
        </p>
      ) : null}
      <div className="summary-status">
        <h2 className="summary-status-label" id="summary-status-heading">
          Applications sent by status
        </h2>
        <dl className="summary-status-list" aria-labelledby="summary-status-heading">
          {statusOrder.map((status) => (
            <div className="summary-status-item" key={status.key}>
              <dt>{status.label}</dt>
              <dd>{summary.counts[status.key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
