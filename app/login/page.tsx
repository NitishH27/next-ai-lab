"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authClient.getSession().then((res: unknown) => {
      const r = res as { data?: { session?: unknown; user?: unknown }; session?: unknown; user?: unknown };
      const session = r?.data?.session || r?.session;
      const user = r?.data?.user || r?.user;
      if (session || user) {
        router.replace("/dashboard");
        return;
      }
      setChecking(false);
    }).catch(() => {
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return <div className="route-loading" aria-live="polite">Loading JobFlow…</div>;
  }

  return (
    <AuthShell variant="login">
      <LoginForm />
    </AuthShell>
  );
}
