type VerificationEmailUser = {
  email: string;
  name?: string | null;
};

export function verificationEmailContent(url: string, name?: string | null) {
  const greeting = name ? `Hi ${name},` : 'Hi,';

  return {
    subject: 'Verify your JobFlowAI email',
    text: [
      greeting,
      '',
      'Confirm your email address to finish setting up your JobFlowAI account. This link expires in 1 hour.',
      '',
      url,
      '',
      "If you didn't create this account, you can ignore this email.",
    ].join('\n'),
    html: [
      `<p>${escapeHtml(greeting)}</p>`,
      '<p>Confirm your email address to finish setting up your JobFlowAI account. This link expires in 1 hour.</p>',
      `<p><a href="${escapeHtml(url)}">Verify email</a></p>`,
      "<p>If you didn't create this account, you can ignore this email.</p>",
    ].join('\n'),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
  user: VerificationEmailUser;
  url: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'JobFlowAI <onboarding@resend.dev>';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'RESEND_API_KEY is not set, so verification emails cannot be sent. Add it to the environment before deploying.',
      );
    }

    console.info(
      `[auth] Verification email for ${user.email} was not sent (no RESEND_API_KEY). Open this link:\n${url}\n`,
    );
    return;
  }

  const content = verificationEmailContent(url, user.name);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: user.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend rejected the verification email (${response.status}): ${detail}`);
  }
}
