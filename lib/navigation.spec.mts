import assert from "node:assert/strict";
import test from "node:test";
import { findWorkspacePage, getWorkspaceTitle, workspacePages } from "./navigation.ts";

test("dashboard record supplies the page label and title without a description", () => {
  assert.deepEqual(findWorkspacePage("/dashboard"), {
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
  });
  assert.equal(getWorkspaceTitle("/dashboard"), "Dashboard");
});

test("applications record supplies the page label, title, and description", () => {
  assert.deepEqual(findWorkspacePage("/applications"), {
    href: "/applications",
    label: "Applications",
    title: "Applications",
    description: "Track and manage your job applications.",
  });
  assert.equal(getWorkspaceTitle("/applications"), "Applications");
});

test("profile record supplies the page label, title, and description outside the primary nav", () => {
  assert.deepEqual(findWorkspacePage("/profile"), {
    href: "/profile",
    label: "Profile",
    title: "Profile",
    description: "Manage your personal details.",
    inPrimaryNav: false,
  });
  assert.equal(getWorkspaceTitle("/profile"), "Profile");
});

test("unknown and nested workspace paths fall back to JobFlow", () => {
  assert.equal(findWorkspacePage("/unknown"), undefined);
  assert.equal(findWorkspacePage("/dashboard/applications"), undefined);
  assert.equal(getWorkspaceTitle("/unknown"), "JobFlow");
  assert.equal(getWorkspaceTitle("/dashboard/applications"), "JobFlow");
});

test("workspace navigation hrefs are unique", () => {
  const hrefs = workspacePages.map((page) => page.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("every workspace page has the required fields", () => {
  for (const page of workspacePages) {
    assert.ok(page.href.startsWith("/"));
    assert.ok(page.label.trim());
    assert.ok(page.title.trim());

    if (page.description !== undefined) {
      assert.ok(page.description.trim());
    }
  }
});
