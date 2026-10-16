"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/auth/PasswordField";
import { startMockSession, validateLogin, type FieldErrors } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    startMockSession();
    router.replace("/dashboard");
  }

  return (
    <div className="auth-card">
      <div className="auth-form-heading">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to JobFlow</h2>
        <p>Use any valid email address and an eight-character password for this prototype.</p>
      </div>
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email ? <p id="login-email-error" className="field-error" role="alert">{errors.email}</p> : null}
        </div>
        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
        />
        <button className="button button-primary" type="submit">Login</button>
        <div className="form-divider"><span>or</span></div>
        <button className="button button-google" type="button" disabled title="Google sign-in is coming soon">
          Continue with Google
        </button>
      </form>
      <p className="auth-switch">New user? <Link href="/signup">Sign up</Link></p>
    </div>
  );
}
