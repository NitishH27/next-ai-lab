import assert from "node:assert/strict";
import test from "node:test";
import { verificationEmailContent } from "./email.ts";

const url = "http://localhost:3000/api/auth/verify-email?token=abc123";

test("verification email includes the link, expiry, and subject", () => {
  const content = verificationEmailContent(url);

  assert.equal(content.subject, "Verify your JobFlowAI email");
  assert.match(content.text, /expires in 1 hour/);
  assert.ok(content.text.includes(url));
  assert.ok(content.html.includes(`href="${url}"`));
});

test("verification email greets the user by name", () => {
  assert.match(verificationEmailContent(url, "Nia").text, /^Hi Nia,/);
});

test("verification email escapes HTML in the name", () => {
  const content = verificationEmailContent(url, '<img src=x onerror="alert(1)">');

  assert.ok(!content.html.includes("<img"));
  assert.match(content.html, /&lt;img/);
});
