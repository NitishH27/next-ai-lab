import {
  signInAlertEmailContent,
  verificationEmailContent,
  welcomeEmailContent,
  type EmailContent,
} from "./email-templates.ts";

export {
  escapeHtml,
  formatSignInTime,
  getFirstName,
  renderEmailLayout,
  signInAlertEmailContent,
  summarizeUserAgent,
  toSafeHttpUrl,
  verificationEmailContent,
  welcomeEmailContent,
} from "./email-templates.ts";

type EmailUser = {
  email: string;
  name?: string | null;
};

type ResendConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
};

const DEFAULT_FROM = "JobFlowAI <onboarding@resend.dev>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_ERROR_DETAIL = 300;

export class ResendDeliveryError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(`Resend rejected the email (${status}): ${detail}`);
    this.name = "ResendDeliveryError";
    this.status = status;
  }
}

function isSafeHeaderValue(value: string): boolean {
  return !/[\r\n]/.test(value);
}

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined;

  if (!apiKey) {
    return null;
  }

  if (!replyTo && process.env.NODE_ENV === "production") {
    throw new Error(
      "EMAIL_REPLY_TO is required in production when email sending is enabled. Add it to the environment before deploying.",
    );
  }

  if (!isSafeHeaderValue(from) || (replyTo && !isSafeHeaderValue(replyTo))) {
    throw new Error("EMAIL_FROM and EMAIL_REPLY_TO must not contain CR or LF characters.");
  }

  return { apiKey, from, replyTo };
}

async function postEmail(
  config: ResendConfig,
  to: string,
  content: EmailContent,
): Promise<void> {
  const payload: Record<string, string> = {
    from: config.from,
    to,
    subject: content.subject,
    text: content.text,
    html: content.html,
  };

  if (config.replyTo) {
    payload.reply_to = config.replyTo;
  }

  if (!isSafeHeaderValue(to)) {
    throw new Error("Recipient email must not contain CR or LF characters.");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, MAX_ERROR_DETAIL);
    throw new ResendDeliveryError(response.status, detail);
  }
}

/**
 * Sends the Better Auth verification email through Resend.
 *
 * Without RESEND_API_KEY the link is logged to the server console so local
 * development works before the sending domain is verified. Production must
 * have a key, otherwise sign-up would silently never deliver the email.
 */
export async function sendVerificationEmail({
  user,
  url,
}: {
  user: EmailUser;
  url: string;
}): Promise<void> {
  const config = getResendConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not set, so verification emails cannot be sent. Add it to the environment before deploying.",
      );
    }

    console.info(
      `[auth] Verification email for ${user.email} was not sent (no RESEND_API_KEY). Open this link:\n${url}\n`,
    );
    return;
  }

  await postEmail(
    config,
    user.email,
    verificationEmailContent(url, user.name),
  );
}

/**
 * Sends the one-time welcome message when verification completes.
 *
 * Callers treat this as best effort: a failure is logged and never changes the
 * verification result. There is no delivery ledger because verification is a
 * one-time transition.
 */
export async function sendWelcomeEmail({
  user,
  appUrl,
}: {
  user: EmailUser;
  appUrl: string;
}): Promise<void> {
  const config = getResendConfig();

  if (!config) {
    console.info("[auth] Welcome email was not sent (no RESEND_API_KEY).");
    return;
  }

  await postEmail(
    config,
    user.email,
    welcomeEmailContent({ name: user.name, appUrl }),
  );
}

/**
 * Sends a new sign-in alert for a later session.
 *
 * Callers decide whether the session is later than the user's first and treat
 * delivery as best effort.
 */
export async function sendSignInAlertEmail({
  user,
  signedInAt,
  userAgent,
}: {
  user: EmailUser;
  signedInAt: Date | string | number;
  userAgent?: string | null;
}): Promise<void> {
  const config = getResendConfig();

  if (!config) {
    console.info("[auth] Sign-in alert email was not sent (no RESEND_API_KEY).");
    return;
  }

  await postEmail(
    config,
    user.email,
    signInAlertEmailContent({
      name: user.name,
      email: user.email,
      signedInAt,
      userAgent,
      replyTo: config.replyTo,
    }),
  );
}
