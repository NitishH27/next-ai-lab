import assert from "node:assert/strict";
import test from "node:test";
import { validateLogin, validateSignup } from "./auth.ts";

test("login validation accepts a valid email and eight-character password", () => {
  assert.deepEqual(validateLogin("person@example.com", "password"), {});
});

test("signup validation requires a name and matching passwords", () => {
  assert.deepEqual(validateSignup("", "person@example.com", "password", "different"), {
    fullName: "Enter your full name.",
    confirmPassword: "Passwords do not match.",
  });
});
