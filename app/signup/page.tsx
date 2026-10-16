"use client";

import AuthRoute from "@/components/auth/AuthRoute";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthRoute>
      <AuthShell variant="signup">
        <SignupForm />
      </AuthShell>
    </AuthRoute>
  );
}
