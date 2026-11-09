import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export const PROFILE_LIMITS = {
  name: 200,
  headline: 120,
  location: 120,
  url: 300,
} as const;

export type ProfileValues = {
  headline: string | null;
  location: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
};

export type ProfileView = ProfileValues & {
  createdAt: string;
  updatedAt: string;
};

export type ProfileFormValues = {
  name: string;
  headline: string;
  location: string;
  websiteUrl: string;
  linkedinUrl: string;
};

export type ProfileField = keyof ProfileFormValues;
export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export function getInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatMemberSince(createdAt: string | Date): string {
  return dayjs.utc(createdAt).format("MMM YYYY");
}

export function getEmailVerificationState(
  emailVerified: boolean | null | undefined,
): "verified" | "unverified" {
  return emailVerified ? "verified" : "unverified";
}

export function toProfileView(
  doc: ProfileValues & { createdAt: Date | string; updatedAt: Date | string },
): ProfileView {
  return {
    headline: doc.headline ?? null,
    location: doc.location ?? null,
    websiteUrl: doc.websiteUrl ?? null,
    linkedinUrl: doc.linkedinUrl ?? null,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

export function toFormValues(
  name: string,
  profile: ProfileValues | null,
): ProfileFormValues {
  return {
    name,
    headline: profile?.headline ?? "",
    location: profile?.location ?? "",
    websiteUrl: profile?.websiteUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
  };
}

function comparable(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function isProfileDirty(
  values: ProfileFormValues,
  baseline: ProfileFormValues,
): boolean {
  return (
    comparable(values.name) !== comparable(baseline.name) ||
    comparable(values.headline) !== comparable(baseline.headline) ||
    comparable(values.location) !== comparable(baseline.location) ||
    comparable(values.websiteUrl) !== comparable(baseline.websiteUrl) ||
    comparable(values.linkedinUrl) !== comparable(baseline.linkedinUrl)
  );
}
