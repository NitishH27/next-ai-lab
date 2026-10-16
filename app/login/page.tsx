"use client";

import AuthRoute from "@/components/auth/AuthRoute";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthRoute>
      <AuthShell variant="login">
        <LoginForm />
      </AuthShell>
    </AuthRoute>
  );
}
