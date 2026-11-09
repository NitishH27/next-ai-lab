import { z } from "zod";
import { PROFILE_LIMITS } from "../profile.ts";

export function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (url.username || url.password || url.port || url.hostname.endsWith(".")) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function isLinkedInUrl(value: string): boolean {
  const url = parseHttpUrl(value);

  if (!url) {
    return false;
  }

  const host = url.hostname.toLowerCase();
  return host === "linkedin.com" || host.endsWith(".linkedin.com");
}

const nameSchema = z
  .string()
  .trim()
  .min(1, "Full name is required.")
  .max(PROFILE_LIMITS.name, "Full name must be 200 characters or fewer.");

function optionalText(max: number, message: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => (value.length === 0 ? null : value));
}

const websiteUrlSchema = optionalText(
  PROFILE_LIMITS.url,
  "Website must be 300 characters or fewer.",
).refine((value) => value === null || parseHttpUrl(value) !== null, {
  message: "Enter a full http:// or https:// URL.",
});

const linkedinUrlSchema = optionalText(
  PROFILE_LIMITS.url,
  "LinkedIn must be 300 characters or fewer.",
).refine((value) => value === null || isLinkedInUrl(value), {
  message: "Enter a linkedin.com URL.",
});

export const personalDetailsSchema = z
  .object({
    name: nameSchema,
    headline: optionalText(
      PROFILE_LIMITS.headline,
      "Headline must be 120 characters or fewer.",
    ),
    location: optionalText(
      PROFILE_LIMITS.location,
      "Location must be 120 characters or fewer.",
    ),
    websiteUrl: websiteUrlSchema,
    linkedinUrl: linkedinUrlSchema,
  })
  .strict();

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
