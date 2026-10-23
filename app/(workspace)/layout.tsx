import type { ReactNode } from "react";
import AuthRoute from "@/components/auth/AuthRoute";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <AuthRoute requireAuthentication>
      <WorkspaceShell>{children}</WorkspaceShell>
    </AuthRoute>
  );
}
