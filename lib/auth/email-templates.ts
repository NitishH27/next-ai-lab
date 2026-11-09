import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export type EmailContent = {
  subject: string;
  preheader: string;
  text: string;
  html: string;
};

export const EMAIL_COLORS = {
  canvas: "#0B0F14",
  surface: "#F7FAFB",
  text: "#11171E",
  textMuted: "#52606B",
  border: "#DCE5EA",
  primary: "#A8DADC",
  primaryText: "#0B0F14",
  accent: "#7FD1CD",
  footerText: "#9AA7B0",
  link: "#0F6B66",
  wordmark: "#E6EDF1",
  headerBorder: "#232D37",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const FONT_STYLE = `font-family:${FONT_STACK};`;
const PARAGRAPH_STYLE = `margin:0 0 16px;${FONT_STYLE}font-size:16px;line-height:1.6;color:${EMAIL_COLORS.text};`;
const SMALL_TEXT_STYLE = `${FONT_STYLE}font-size:13px;line-height:1.6;color:${EMAIL_COLORS.textMuted};`;
const LIST_STYLE = `margin:0 0 16px;padding-left:20px;${FONT_STYLE}font-size:16px;line-height:1.6;color:${EMAIL_COLORS.text};`;
const DETAIL_LIST_STYLE = `margin:0 0 16px;padding:0;list-style:none;${FONT_STYLE}font-size:16px;line-height:1.6;color:${EMAIL_COLORS.text};`;

type EmailButton = {
  label: string;
  url: string;
};

type EmailLayoutInput = {
  subject: string;
  preheader: string;
  heading: string;
  bodyHtml: string;
  bodyText: string;
  button?: EmailButton;
  noteHtml?: string;
  noteText?: string;
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getFirstName(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.split(/\s+/)[0] ?? "";
}

export function formatSignInTime(value: Date | string | number): string {
  const date = dayjs.utc(value);
  return date.isValid() ? date.format("MMM D, YYYY [at] HH:mm [UTC]") : "Unknown time";
}

export function summarizeUserAgent(userAgent?: string | null): string {
  if (!userAgent?.trim()) {
    return "Unknown device";
  }

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /SamsungBrowser\//.test(userAgent)
        ? "Samsung Internet"
        : /CriOS\//.test(userAgent) || /Chrome\//.test(userAgent)
          ? "Chrome"
          : /FxiOS\//.test(userAgent) || /Firefox\//.test(userAgent)
            ? "Firefox"
            : /Version\/.*Safari\//.test(userAgent)
              ? "Safari"
              : "";

  const platform = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && /Mobile\//.test(userAgent))
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Windows NT/.test(userAgent)
          ? "Windows"
          : /Macintosh|Mac OS X/.test(userAgent)
            ? "macOS"
            : /CrOS/.test(userAgent)
              ? "ChromeOS"
              : /Linux/.test(userAgent)
                ? "Linux"
                : "";

  if (browser && platform) {
    return `${browser} on ${platform}`;
  }

  if (browser) {
    return browser;
  }

  if (platform) {
    return platform;
  }

  return "Unknown device";
}

export function toSafeHttpUrl(value: string): string | null {
  if (!value || /[\r\n]/.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (url.username || url.password || !url.hostname) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function shouldSendSignInAlert(activeSessionCount: number): boolean {
  return Number.isFinite(activeSessionCount) && activeSessionCount > 1;
}

function paragraph(html: string): string {
  return `<p style="${PARAGRAPH_STYLE}">${html}</p>`;
}

function renderList(items: string[]): string {
  return `<ul style="${LIST_STYLE}">${items
    .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function renderButton(button: EmailButton): string {
  const safeUrl = toSafeHttpUrl(button.url);
  if (!safeUrl) {
    throw new Error("Email button URL must be an absolute http or https URL.");
  }

  const label = escapeHtml(button.label);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;border-collapse:separate;"><tr><td align="center" bgcolor="${EMAIL_COLORS.primary}" style="border-radius:8px;"><a class="email-button" href="${escapeHtml(safeUrl)}" style="display:inline-block;min-height:44px;box-sizing:border-box;padding:13px 20px;border-radius:8px;${FONT_STYLE}font-size:14px;line-height:18px;font-weight:600;color:${EMAIL_COLORS.primaryText};text-decoration:none;">${label}</a></td></tr></table>`;
}

function renderFallback(safeUrl: string): string {
  const escapedUrl = escapeHtml(safeUrl);

  return `<p style="${SMALL_TEXT_STYLE}margin:12px 0 0;">If the button doesn't work, copy and paste this link into your browser:</p><p style="${SMALL_TEXT_STYLE}margin:4px 0 0;word-break:break-all;"><a href="${escapedUrl}" style="color:${EMAIL_COLORS.link};text-decoration:underline;">${escapedUrl}</a></p>`;
}

function renderHeader(): string {
  return `<tr><td style="padding:8px 4px 16px;border-bottom:1px solid ${EMAIL_COLORS.headerBorder};"><span style="display:inline-block;${FONT_STYLE}font-size:18px;line-height:1.2;font-weight:600;letter-spacing:-0.01em;color:${EMAIL_COLORS.wordmark};">JobFlow</span><span style="display:inline-block;width:6px;height:6px;margin-left:6px;border-radius:50%;background-color:${EMAIL_COLORS.accent};vertical-align:middle;"></span></td></tr><tr><td style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

function renderFooter(): string {
  return `<tr><td style="padding:20px 4px 0;${FONT_STYLE}font-size:12px;line-height:1.6;color:${EMAIL_COLORS.footerText};">You're receiving this because you created a JobFlowAI account.</td></tr>`;
}

export function renderEmailLayout({
  subject,
  preheader,
  heading,
  bodyHtml,
  bodyText,
  button,
  noteHtml,
  noteText,
}: EmailLayoutInput): { html: string; text: string } {
  let buttonHtml = "";
  let buttonText = "";

  if (button) {
    const safeUrl = toSafeHttpUrl(button.url);
    if (!safeUrl) {
      throw new Error("Email button URL must be an absolute http or https URL.");
    }

    buttonHtml = `${renderButton(button)}${renderFallback(safeUrl)}`;
    buttonText = `\n\n${button.label}: ${safeUrl}`;
  }

  const noteBlock = noteHtml
    ? `<div style="margin:20px 0 0;padding-top:16px;border-top:1px solid ${EMAIL_COLORS.border};${SMALL_TEXT_STYLE}">${noteHtml}</div>`
    : "";
  const note = noteText ? `\n\n${noteText}` : "";
  const footer = "You're receiving this because you created a JobFlowAI account.";
  const text = `${heading}\n\n${bodyText}${buttonText}${note}\n\n${footer}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(subject)}</title>
<style>
@media only screen and (max-width: 480px) {
  .email-outer { padding: 12px !important; }
  .email-card { padding: 24px !important; }
  .email-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${EMAIL_COLORS.canvas}" style="margin:0;padding:0;background-color:${EMAIL_COLORS.canvas};">
<tr><td class="email-outer" align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
${renderHeader()}
<tr><td class="email-card" style="padding:32px;background-color:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.border};border-radius:12px;">
<h1 style="margin:0 0 20px;${FONT_STYLE}font-size:24px;line-height:1.3;font-weight:600;color:${EMAIL_COLORS.text};">${escapeHtml(heading)}</h1>
${bodyHtml}
${buttonHtml}
${noteBlock}
</td></tr>
${renderFooter()}
</table>
</td></tr>
</table>
</body>
</html>`;

  return { html, text };
}

function buildContent(
  subject: string,
  preheader: string,
  layout: Omit<EmailLayoutInput, "subject" | "preheader">,
): EmailContent {
  return {
    subject,
    preheader,
    ...renderEmailLayout({ subject, preheader, ...layout }),
  };
}

function createGreeting(name?: string | null): string {
  const firstName = getFirstName(name);
  return firstName ? `Hi ${firstName},` : "Hi,";
}

export function verificationEmailContent(url: string, name?: string | null): EmailContent {
  const safeUrl = toSafeHttpUrl(url);
  if (!safeUrl) {
    throw new Error("Verification URL must be an absolute http or https URL.");
  }

  const greeting = createGreeting(name);
  const intro =
    "Confirm your email address to finish setting up your JobFlowAI account. This link expires in 1 hour.";
  const noteText = "If you didn't create this account, you can ignore this email.";

  return buildContent("Verify your JobFlowAI email", "Confirm your email to finish setting up JobFlowAI. This link expires in 1 hour.", {
    heading: "Verify your email",
    bodyHtml: paragraph(escapeHtml(greeting)) + paragraph(intro),
    bodyText: `${greeting}\n\n${intro}`,
    button: { label: "Verify email", url: safeUrl },
    noteHtml: escapeHtml(noteText),
    noteText,
  });
}

export function welcomeEmailContent({
  name,
  appUrl,
}: {
  name?: string | null;
  appUrl: string;
}): EmailContent {
  const safeAppUrl = toSafeHttpUrl(appUrl);
  if (!safeAppUrl) {
    throw new Error("Welcome app URL must be an absolute http or https URL.");
  }

  const dashboardUrl = new URL("/dashboard", safeAppUrl).toString();
  const greeting = createGreeting(name);
  const intro =
    "Your email is verified and your account is ready. JobFlowAI keeps your applications, statuses, and weekly activity in one place.";
  const items = [
    "Add your first application.",
    "Keep each status current as you move forward.",
    "Review your weekly activity to see your momentum.",
  ];
  const noteText = "You can update your details from Profile at any time.";

  return buildContent("Welcome to JobFlowAI", "Your email is verified. Here's how to get started.", {
    heading: "Welcome to JobFlowAI",
    bodyHtml: paragraph(escapeHtml(greeting)) + paragraph(intro) + renderList(items),
    bodyText: `${greeting}\n\n${intro}\n\n${items.map((item) => `- ${item}`).join("\n")}`,
    button: { label: "Open JobFlowAI", url: dashboardUrl },
    noteHtml: escapeHtml(noteText),
    noteText,
  });
}

export function signInAlertEmailContent({
  name,
  email,
  signedInAt,
  userAgent,
  replyTo,
}: {
  name?: string | null;
  email: string;
  signedInAt: Date | string | number;
  userAgent?: string | null;
  replyTo?: string | null;
}): EmailContent {
  const greeting = createGreeting(name);
  const intro = "A new sign-in to your JobFlowAI account was detected.";
  const details = [
    ["Account", email],
    ["Time", formatSignInTime(signedInAt)],
    ["Device", summarizeUserAgent(userAgent)],
  ] as const;
  const replySentence = replyTo?.trim()
    ? "If you don't recognize this sign-in, reply to this email and we'll help you secure your account."
    : "";
  const detailsHtml = `<ul style="${DETAIL_LIST_STYLE}">${details
    .map(
      ([label, value]) =>
        `<li style="margin:0 0 8px;"><span style="color:${EMAIL_COLORS.textMuted};">${escapeHtml(label)}:</span> ${escapeHtml(value)}</li>`,
    )
    .join("")}</ul>`;

  return buildContent(
    "New sign-in to your JobFlowAI account",
    "A new sign-in was detected on your JobFlowAI account.",
    {
      heading: "New sign-in detected",
      bodyHtml:
        paragraph(escapeHtml(greeting)) +
        paragraph(intro) +
        detailsHtml +
        paragraph("If this was you, no action is needed.") +
        (replySentence ? paragraph(replySentence) : ""),
      bodyText: [
        greeting,
        "",
        intro,
        "",
        ...details.map(([label, value]) => `${label}: ${value}`),
        "",
        "If this was you, no action is needed.",
        ...(replySentence ? [replySentence] : []),
      ].join("\n"),
    },
  );
}
