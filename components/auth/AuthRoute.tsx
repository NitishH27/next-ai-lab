"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isMockAuthenticated } from "@/lib/auth";

type AuthRouteProps = {
  children: ReactNode;
  requireAuthentication?: boolean;
};

export default function AuthRoute({ children, requireAuthentication = false }: AuthRouteProps) {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    () => () => undefined,
    isMockAuthenticated,
    () => false,
  );
  const redirectTo = requireAuthentication
    ? (isAuthenticated ? null : "/login")
    : (isAuthenticated ? "/dashboard" : null);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  if (redirectTo) {
    return <div className="route-loading" aria-live="polite">Loading JobFlow…</div>;
  }

  return <>{children}</>;
}
