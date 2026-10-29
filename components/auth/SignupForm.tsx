"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import { validateSignup, type FieldErrors } from "@/lib/auth";
import { authClient } from "@/lib/auth/client";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSignup(fullName, email, password, confirmPassword);
    setErrors(validationErrors);
    setFormError(null);
    setSuccess(false);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const res = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password,
        name: fullName.trim(),
      });

      if (res?.error) {
        const message = res.error.message || "";
        if (message.toLowerCase().includes("email")) {
          setErrors((prev) => ({ ...prev, email: "This email is already in use." }));
          return;
        }
        setFormError("Unable to create account.");
        return;
      }

      setSuccess(true);
    } catch (e) {
      setFormError("Unable to create account.");
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-form-heading">
        <p className="eyebrow">Create your workspace</p>
        <h2>Start your JobFlow</h2>
        <p>Keep every application, conversation, and next step in one calm place.</p>
      </div>
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "signup-name-error" : undefined}
          />
          {errors.fullName ? <p id="signup-name-error" className="field-error" role="alert">{errors.fullName}</p> : null}
        </div>
        <div className="form-field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
          />
          {errors.email ? <p id="signup-email-error" className="field-error" role="alert">{errors.email}</p> : null}
        </div>
        <PasswordField
          id="signup-password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordField
          id="signup-confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        {formError ? <p className="field-error" role="alert">{formError}</p> : null}
        {success ? <p className="field-success" role="status">Check your email to verify your account before signing in.</p> : null}
        <button className="button button-primary" type="submit">Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
    </div>
  );
}
