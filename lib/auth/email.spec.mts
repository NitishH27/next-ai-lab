import assert from "node:assert/strict";
import test from "node:test";
import {
  sendSignInAlertEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email.ts";
import {
  EMAIL_COLORS,
  escapeHtml,
  formatSignInTime,
  getFirstName,
  signInAlertEmailContent,
  shouldSendSignInAlert,
  summarizeUserAgent,
  toSafeHttpUrl,
  verificationEmailContent,
  welcomeEmailContent,
} from "./email-templates.ts";

const url = "http://localhost:3000/api/auth/verify-email?token=abc123";
const appUrl = "http://localhost:3000";
const hostileName = '<img src=x onerror="alert(1)">';
const chromeWindows =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

test("verification email includes the link, expiry, subject, and preheader", () => {
  const content = verificationEmailContent(url);

  assert.equal(content.subject, "Verify your JobFlowAI email");
  assert.match(content.preheader, /expires in 1 hour/);
  assert.match(content.text, /expires in 1 hour/);
  assert.ok(content.text.includes(url));
  assert.ok(content.html.includes(`href="${url}"`));
  assert.match(content.html, />Verify email</);
  assert.match(content.html, /If the button doesn't work/);
});

test("verification email greets the user by first name", () => {
  assert.match(verificationEmailContent(url, "Nia").text, /\nHi Nia,/);
  assert.match(verificationEmailContent(url, "  Nia  ").text, /\nHi Nia,/);
});

test("verification email falls back to a plain greeting", () => {
  assert.match(verificationEmailContent(url).text, /\nHi,/);
  assert.match(verificationEmailContent(url, "   ").text, /\nHi,/);
});

test("verification email escapes HTML in the name", () => {
  const content = verificationEmailContent(url, hostileName);

  assert.ok(!content.html.includes("<img"));
  assert.match(content.html, /&lt;img/);
});

test("verification email rejects unsafe URLs", () => {
  assert.throws(() => verificationEmailContent("javascript:alert(1)"));
  assert.throws(() => verificationEmailContent("/relative/verify"));
});

test("welcome email includes the dashboard URL and getting-started points", () => {
  const content = welcomeEmailContent({ name: "Nia", appUrl });

  assert.equal(content.subject, "Welcome to JobFlowAI");
  assert.match(content.preheader, /Your email is verified/);
  assert.match(content.text, /\nHi Nia,/);
  assert.match(content.text, /Add your first application/);
  assert.ok(content.text.includes("weekly activity"));
  assert.ok(content.text.includes(`${appUrl}/dashboard`));
  assert.ok(content.html.includes(`href="${appUrl}/dashboard"`));
  assert.match(content.html, />Open JobFlowAI</);
});

test("welcome email rejects an unsafe app URL", () => {
  assert.throws(() => welcomeEmailContent({ name: "Nia", appUrl: "data:text/html,hello" }));
});

test("sign-in alert includes account, UTC time, device, and reply instruction", () => {
  const content = signInAlertEmailContent({
    name: "Nia",
    email: "nia@example.com",
    signedInAt: "2026-11-09T14:32:00Z",
    userAgent: chromeWindows,
    replyTo: "support@example.com",
  });

  assert.equal(content.subject, "New sign-in to your JobFlowAI account");
  assert.match(content.preheader, /new sign-in/i);
  assert.match(content.text, /\nHi Nia,/);
  assert.match(content.text, /Account: nia@example\.com/);
  assert.match(content.text, /Time: Nov 9, 2026 at 14:32 UTC/);
  assert.match(content.text, /Device: Chrome on Windows/);
  assert.match(content.text, /If this was you, no action is needed\./);
  assert.match(content.text, /reply to this email/);
  assert.match(content.html, /New sign-in detected/);
});

test("sign-in alert omits the reply instruction when no reply address is set", () => {
  const content = signInAlertEmailContent({
    name: "Nia",
    email: "nia@example.com",
    signedInAt: "2026-11-09T14:32:00Z",
    userAgent: chromeWindows,
  });

  assert.ok(!content.text.includes("reply to this email"));
  assert.ok(!content.text.includes("secure it as soon as possible"));
  assert.match(content.text, /If this was you, no action is needed\./);
});

test("sign-in alert has no primary CTA and hides sensitive values", () => {
  const content = signInAlertEmailContent({
    name: "Nia",
    email: "nia@example.com",
    signedInAt: "2026-11-09T14:32:00Z",
    userAgent: chromeWindows,
    replyTo: "support@example.com",
  });

  assert.ok(!content.html.includes('bgcolor="#A8DADC"'));
  assert.ok(!content.html.includes("Open JobFlowAI"));
  assert.ok(!content.html.includes("Mozilla/5.0"));
  assert.ok(!content.text.includes("Mozilla/5.0"));
  assert.ok(!content.html.includes("token="));
  assert.ok(!content.text.includes("token="));
  assert.ok(!content.text.includes("IP address:"));
});

test("sign-in alert escapes the email and device label", () => {
  const content = signInAlertEmailContent({
    name: hostileName,
    email: 'nia"><script>alert(1)</script>@example.com',
    signedInAt: "2026-11-09T14:32:00Z",
    userAgent: "<script>alert(1)</script>",
  });

  assert.ok(!content.html.includes("<script>"));
  assert.match(content.html, /&lt;script&gt;/);
  assert.match(content.html, /&lt;img/);
});

test("the shared shell is accessible, self-contained, and 600px wide", () => {
  const content = verificationEmailContent(url, "Nia");

  assert.match(content.html, /^<!doctype html>/);
  assert.match(content.html, /<html lang="en">/);
  assert.match(content.html, /<meta name="color-scheme" content="light only">/);
  assert.match(
    content.html,
    /<meta name="supported-color-schemes" content="light only">/,
  );
  assert.ok(content.html.includes(`<title>${content.subject}</title>`));
  assert.ok(content.html.includes('role="presentation"'));
  assert.ok(content.html.includes("max-width:600px"));
  assert.ok(content.html.includes("min-height:44px"));
  assert.ok(content.html.includes("display:none;max-height:0"));
  assert.ok(content.html.includes("background-color:#0B0F14"));
  assert.ok(content.html.includes("background-color:#F7FAFB"));
  assert.ok(content.html.includes("#A8DADC"));
  assert.ok(content.html.includes(".email-button"));
  assert.equal((content.html.match(/<h1/g) ?? []).length, 1);
  assert.match(content.html, /word-break:break-all/);
  assert.ok(!content.html.includes("<img"));
  assert.ok(!content.html.includes("<svg"));
  assert.ok(!content.html.includes("<script"));
  assert.ok(!content.html.includes("<form"));
  assert.ok(!content.html.includes("<link"));
  assert.ok(!content.html.includes("@font-face"));
  assert.ok(!content.html.includes("<iframe"));
});

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) => {
    const channel = Number.parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * (channels[0] ?? 0) +
    0.7152 * (channels[1] ?? 0) +
    0.0722 * (channels[2] ?? 0)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test("the email text pairs meet WCAG AA", () => {
  const pairs = [
    [EMAIL_COLORS.text, EMAIL_COLORS.surface],
    [EMAIL_COLORS.textMuted, EMAIL_COLORS.surface],
    [EMAIL_COLORS.link, EMAIL_COLORS.surface],
    [EMAIL_COLORS.primaryText, EMAIL_COLORS.primary],
    [EMAIL_COLORS.footerText, EMAIL_COLORS.canvas],
  ];

  for (const [foreground, background] of pairs) {
    assert.ok(
      contrastRatio(foreground ?? "", background ?? "") >= 4.5,
      `${foreground} on ${background} must meet WCAG AA`,
    );
  }
});

test("getFirstName returns the first trimmed name or an empty fallback", () => {
  assert.equal(getFirstName("  Nia  "), "Nia");
  assert.equal(getFirstName("Nia Okafor"), "Nia");
  assert.equal(getFirstName(""), "");
  assert.equal(getFirstName("   "), "");
  assert.equal(getFirstName(null), "");
  assert.equal(getFirstName(undefined), "");
});

test("formatSignInTime formats UTC with the existing dayjs plugin", () => {
  assert.equal(
    formatSignInTime(new Date("2026-11-09T14:32:00Z")),
    "Nov 9, 2026 at 14:32 UTC",
  );
  assert.equal(formatSignInTime("2026-01-02T03:04:00Z"), "Jan 2, 2026 at 03:04 UTC");
  assert.equal(formatSignInTime("not a date"), "Unknown time");
});

test("summarizeUserAgent returns a short browser and platform label", () => {
  assert.equal(summarizeUserAgent(chromeWindows), "Chrome on Windows");
  assert.equal(
    summarizeUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    ),
    "Safari on macOS",
  );
  assert.equal(
    summarizeUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    ),
    "Safari on iPhone",
  );
  assert.equal(
    summarizeUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ),
    "Edge on Windows",
  );
  assert.equal(summarizeUserAgent(""), "Unknown device");
  assert.equal(summarizeUserAgent(null), "Unknown device");
  assert.equal(summarizeUserAgent("curl/8.0"), "Unknown device");
});

test("toSafeHttpUrl accepts absolute HTTP URLs and rejects unsafe ones", () => {
  assert.equal(toSafeHttpUrl("https://example.com/path?q=1"), "https://example.com/path?q=1");
  assert.equal(toSafeHttpUrl("http://localhost:3000/dashboard"), "http://localhost:3000/dashboard");
  assert.equal(toSafeHttpUrl("javascript:alert(1)"), null);
  assert.equal(toSafeHttpUrl("data:text/html,hello"), null);
  assert.equal(toSafeHttpUrl("/dashboard"), null);
  assert.equal(toSafeHttpUrl("ftp://example.com/file"), null);
  assert.equal(toSafeHttpUrl("https://user:pass@example.com"), null);
  assert.equal(toSafeHttpUrl("https://example.com/\r\nX-Injected: yes"), null);
  assert.equal(toSafeHttpUrl("not a url"), null);
  assert.equal(toSafeHttpUrl(""), null);
});

test("escapeHtml escapes every interpolated special character", () => {
  assert.equal(
    escapeHtml(`<&>"'`),
    "&lt;&amp;&gt;&quot;&#39;",
  );
});

test("the first active session is skipped and a later session sends an alert", () => {
  assert.equal(shouldSendSignInAlert(0), false);
  assert.equal(shouldSendSignInAlert(1), false);
  assert.equal(shouldSendSignInAlert(2), true);
  assert.equal(shouldSendSignInAlert(3), true);
  assert.equal(shouldSendSignInAlert(Number.NaN), false);
});

type FetchCall = {
  input: RequestInfo | URL;
  init?: RequestInit;
};

function withEnv(values: Record<string, string | undefined>) {
  const previous: Record<string, string | undefined> = {};

  for (const key of Object.keys(values)) {
    previous[key] = process.env[key];
    const value = values[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const key of Object.keys(previous)) {
      const value = previous[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

test("verification transport sends the expected Resend payload", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "JobFlowAI <mail@example.com>",
    EMAIL_REPLY_TO: "reply@example.com",
    NODE_ENV: "test",
  });
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response("", { status: 200 });
  };

  try {
    await sendVerificationEmail({
      user: { email: "person@example.com", name: "Nia" },
      url,
    });
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.input, "https://api.resend.com/emails");
  assert.equal(calls[0]?.init?.method, "POST");
  assert.equal(calls[0]?.init?.signal instanceof AbortSignal, true);

  const body = JSON.parse(String(calls[0]?.init?.body)) as Record<string, string>;
  assert.equal(body.from, "JobFlowAI <mail@example.com>");
  assert.equal(body.to, "person@example.com");
  assert.equal(body.subject, "Verify your JobFlowAI email");
  assert.equal(body.reply_to, "reply@example.com");
  assert.ok(body.text.includes(url));
  assert.ok(body.html.includes(`href="${url}"`));
});

test("welcome transport omits reply_to when EMAIL_REPLY_TO is unset", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: undefined,
    EMAIL_REPLY_TO: undefined,
    NODE_ENV: "test",
  });
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response("", { status: 200 });
  };

  try {
    await sendWelcomeEmail({ user: { email: "person@example.com", name: "Nia" }, appUrl });
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }

  const body = JSON.parse(String(calls[0]?.init?.body)) as Record<string, string>;
  assert.equal(body.from, "JobFlowAI <onboarding@resend.dev>");
  assert.equal(body.subject, "Welcome to JobFlowAI");
  assert.equal(body.reply_to, undefined);
});

test("sign-in alert transport builds the alert payload", async () => {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "JobFlowAI <mail@example.com>",
    EMAIL_REPLY_TO: "support@example.com",
    NODE_ENV: "test",
  });
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return new Response("", { status: 200 });
  };

  try {
    await sendSignInAlertEmail({
      user: { email: "person@example.com", name: "Nia" },
      signedInAt: "2026-11-09T14:32:00Z",
      userAgent: chromeWindows,
    });
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }

  const body = JSON.parse(String(calls[0]?.init?.body)) as Record<string, string>;
  assert.equal(body.subject, "New sign-in to your JobFlowAI account");
  assert.match(body.text, /Chrome on Windows/);
  assert.ok(!body.text.includes("Mozilla/5.0"));
});

test("verification transport surfaces a bounded non-2xx error", async () => {
  const originalFetch = globalThis.fetch;
  const restoreEnv = withEnv({
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "JobFlowAI <mail@example.com>",
    EMAIL_REPLY_TO: "reply@example.com",
    NODE_ENV: "test",
  });
  globalThis.fetch = async () => new Response("invalid from address", { status: 422 });

  try {
    await assert.rejects(
      () =>
        sendVerificationEmail({
          user: { email: "person@example.com", name: "Nia" },
          url,
        }),
      /Resend rejected the email \(422\): invalid from address/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});
