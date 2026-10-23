export type WorkspacePage = {
  href: string;
  label: string;
  title: string;
  description?: string;
};

export const workspacePages: readonly WorkspacePage[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
    description: "Welcome to dashboard.",
  },
];

export function findWorkspacePage(pathname: string): WorkspacePage | undefined {
  return workspacePages.find((page) => page.href === pathname);
}

export function getWorkspaceTitle(pathname: string): string {
  return findWorkspacePage(pathname)?.title ?? "JobFlow";
}
