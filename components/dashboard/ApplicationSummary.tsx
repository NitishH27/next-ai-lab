import type { ReactNode } from "react";
import {
  Award,
  CircleX,
  Clock,
  MessageCircleCheck,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { ApplicationSummary } from "@/lib/applications";

type SummaryCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "sent" | "positive" | "offers" | "rejected" | "awaiting";
  detail: string;
  warn?: boolean;
  children?: ReactNode;
};

function SummaryCard({ label, value, icon: Icon, tone, detail, warn, children }: SummaryCardProps) {
  return (
    <li className={`summary-card summary-card--${tone}${warn ? " is-warning" : ""}`}>
      <div className="summary-card-header">
        <Icon
          className="summary-card-icon"
          size={20}
          strokeWidth={2}
          absoluteStrokeWidth
          aria-hidden="true"
        />
        <p className="summary-card-label">{label}</p>
      </div>
      <p className="summary-card-value">{value}</p>
      <p className={`summary-card-detail${warn ? " is-warning" : ""}`}>{detail}</p>
      {children}
    </li>
  );
}

export default function ApplicationSummary({ summary }: { summary: ApplicationSummary }) {
  const rate = summary.responseRate === null ? "—" : `${summary.responseRate}% of resolved`;
  const staleDetail =
    summary.stale === 0 ? "No follow-ups due" : `${summary.stale} need follow-up`;

  return (
    <section aria-labelledby="summary-heading">
      <h2 className="visually-hidden" id="summary-heading">
        Application status summary
      </h2>
      <ul className="summary-grid">
        <SummaryCard
          label="Applications sent"
          value={summary.sent}
          icon={Send}
          tone="sent"
          detail="All time"
        >
          <dl className="summary-breakdown">
            <div>
              <dt>Applied</dt>
              <dd>{summary.counts.applied}</dd>
            </div>
            <div>
              <dt>Screening</dt>
              <dd>{summary.counts.screening}</dd>
            </div>
            <div>
              <dt>Interview</dt>
              <dd>{summary.counts.interview}</dd>
            </div>
            <div>
              <dt>Offer</dt>
              <dd>{summary.counts.offer}</dd>
            </div>
            <div>
              <dt>Rejected</dt>
              <dd>{summary.counts.rejected}</dd>
            </div>
            <div>
              <dt>Withdrawn</dt>
              <dd>{summary.counts.withdrawn}</dd>
            </div>
          </dl>
        </SummaryCard>
        <SummaryCard
          label="Positive responses"
          value={summary.positive}
          icon={MessageCircleCheck}
          tone="positive"
          detail={rate}
        />
        <SummaryCard
          label="Offers"
          value={summary.offers}
          icon={Award}
          tone="offers"
          detail={rate}
        />
        <SummaryCard
          label="Rejected"
          value={summary.rejected}
          icon={CircleX}
          tone="rejected"
          detail={`${summary.rejected} of ${summary.resolved} resolved`}
        />
        <SummaryCard
          label="Awaiting review"
          value={summary.awaiting}
          icon={Clock}
          tone="awaiting"
          detail={staleDetail}
          warn={summary.stale > 0}
        />
      </ul>
    </section>
  );
}
