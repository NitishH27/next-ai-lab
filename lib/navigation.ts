export type WorkspacePage = {
  href: string;
  label: string;
  title: string;
  description?: string;
  /** Set false for routes reachable outside the primary nav, such as the account menu. */
  inPrimaryNav?: boolean;
};

export const workspacePages: readonly WorkspacePage[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
  },
  {
    href: "/applications",
    label: "Applications",
    title: "Applications",
    description: "Track and manage your job applications.",
  },
  {
    href: "/profile",
    label: "Profile",
    title: "Profile",
    description: "Manage your personal details.",
    inPrimaryNav: false,
  },
];

export function findWorkspacePage(pathname: string): WorkspacePage | undefined {
  return workspacePages.find((page) => page.href === pathname);
}

export function getWorkspaceTitle(pathname: string): string {
  return findWorkspacePage(pathname)?.title ?? "JobFlow";
}
