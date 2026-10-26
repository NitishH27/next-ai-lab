import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import WorkspaceShell from "@/components/layout/WorkspaceShell";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
