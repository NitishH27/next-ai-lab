import { BadgeCheck, CircleAlert, ExternalLink } from "lucide-react";
import { formatMemberSince, getEmailVerificationState, getInitials } from "@/lib/profile";

type ProfileSummaryProps = {
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  headline: string | null;
  location: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
};

export function ProfileSummary({
  name,
  email,
  emailVerified,
  createdAt,
  headline,
  location,
  websiteUrl,
  linkedinUrl,
}: ProfileSummaryProps) {
  const identity = [headline, location].filter(Boolean).join(" · ");
  const links = [
    { href: websiteUrl, label: "Website" },
    { href: linkedinUrl, label: "LinkedIn" },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href));

  return (
    <section className="profile-summary" aria-labelledby="profile-summary-heading">
      <span className="profile-summary-avatar" aria-hidden="true">
        {getInitials(name || email)}
      </span>
      <div className="profile-summary-body">
        <h2 className="profile-summary-name" id="profile-summary-heading">
          {name || email}
        </h2>
        {identity ? <p className="profile-summary-line">{identity}</p> : null}
        <p className="profile-summary-meta">
          <span className="profile-summary-email">{email}</span>
          {getEmailVerificationState(emailVerified) === "verified" ? (
            <span className="profile-verified">
              <BadgeCheck aria-hidden="true" size={14} strokeWidth={1.75} />
              Verified
            </span>
          ) : (
            <span className="profile-unverified">
              <CircleAlert aria-hidden="true" size={14} strokeWidth={1.75} />
              Email not verified
            </span>
          )}
        </p>
        <p className="profile-summary-since">
          Member since <time dateTime={createdAt}>{formatMemberSince(createdAt)}</time>
        </p>
        {links.length > 0 ? (
          <ul className="profile-summary-links">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  className="profile-summary-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{link.href}</span>
                  <ExternalLink aria-hidden="true" size={14} strokeWidth={1.75} />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
