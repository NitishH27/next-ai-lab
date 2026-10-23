# App Tasks

Use this file as the implementation backlog for requirements in `PRD.md`. Codex should review it when asked to find or implement pending app tasks. Add each task under **To Do** with a clear, actionable title, its PRD ID, and a short description of the expected result. Move tasks between sections as their status changes.

## To Do

<!-- Add new implementation tasks here, including tasks under active grilling. -->

## Ready for Code

<!-- Move tasks here when their grilling resolves; they are specified but not yet being implemented. -->

## In Progress

<!-- Move tasks here when implementation starts; they stay here until code and checks are done. -->

## Done

- **PRD-003.1 — Add the workspace route group and shared page titles:** Moved the dashboard to `app/(workspace)/dashboard/page.tsx`, added `app/(workspace)/layout.tsx` with the shared `AuthRoute` guard, created `lib/navigation.ts` and `lib/navigation.spec.mts`, and removed the dashboard's own guard and heading.
- **PRD-003.2 — Build the light fluid sidebar and logo tiles:** Added `components/layout/WorkspaceShell.tsx` with the light sticky rail, expanded and collapsed logo tiles, `layout-dashboard` nav icon, `panel-left-close`/`panel-left-open` controls, token-based active and hover states, collapsed-rail flyouts, and the in-memory expanded default.
- **PRD-003.3 — Add the responsive frame and accessibility behavior:** Implemented the two-column fluid shell, compact header, skip link, compact-viewport override, RTL logical layout and icon mirroring, 200ms column transition, 150ms color transitions, hover-only styles, 2px focus rings, 0.96 press scale, scroll containment, and reduced-motion overrides.
- **PRD-003.4 — Revalidate the dashboard and document the shell:** Kept the PRD-002 widgets and chart intact, moved card layout to content-area container queries, used a 9rem content-box breakdown threshold, verified the 1280×800 and 320px layouts, keyboard focus, tooltips, RTL geometry, reduced motion, and contrast, recorded the DOM-spec exception, and passed `npm test`, `npm run lint`, and `npm run build`.
- **PRD-003.0 — Grill the shared workspace shell requirement:** Confirmed the shell is for signed-in routes only, the sidebar navigates only to existing pages, the page title is `Dashboard` with `Welcome to dashboard.` as its description, and the current logo filenames stay. Resolved a light sidebar with dark navy logo tiles, confirmed `layout-dashboard`, `panel-left-close`, and `panel-left-open` Lucide icons, Ocean Depths token states, a navy reversed active pill, a collapsed rail below 48rem, an in-memory collapsed boolean defaulting to expanded, fluid percentage/`clamp()` widths, and an 11rem PRD-002 breakdown threshold for the sidebar-constrained card width.
- **PRD-002.5 — Add weekly trend data helper:** Extended the seed `appliedAt` dates across the 12-week window, added the typed weekly bucket helper for applied, rejected, and interview counts, and extended `lib/applications.spec.mts` with bucket, boundary, out-of-window, future-date, aggregation, empty, and seed cases.
- **PRD-002.6 — Build the applications trend chart:** Added `recharts`, the accessible trend card with three themed 12-week lines (Applied, Rejected, Interview), matching legend, tooltip, empty-window state, hidden data table, dashboard wiring, and the responsive layout that keeps the five widgets in the top half and the chart in the lower half. Verified `npm test`, `npm run lint`, and `npm run build`.
- **PRD-002.1 — Add applications model and summary helper:** Created `lib/applications.ts` with the six-status model, typed application records, relative-date sample data, `getApplications()`, and `summarizeApplications()`. Added `lib/applications.spec.mts` and wired it into `npm test`.
- **PRD-002.2 — Build the dashboard summary widgets:** Added `lucide-react` and the five compact KPI cards with label, count, leading Lucide icon (`send`, `message-circle-check`, `award`, `circle-x`, `clock`) at 20px with 2px absolute stroke, supporting line, resolved response rate, stale follow-up flag, tabular numerals, and the Applications sent six-status breakdown in a two-column list, using the existing card pattern and Ocean Depths tokens.
- **PRD-002.3 — Add sample-data and empty states:** Showed the hardcoded-data notice above the widgets, and the zero-state message when the dataset is empty, with no dead links or buttons.
- **PRD-002.4 — Validate dashboard widgets:** Verified the 1280×800 top-half fit and 240px card budget from the final CSS geometry, single-row layout at 1024px+, 320px/tablet wrapping, the sent card breakdown, icon placement/stroke/alignment against `better-ui`, icon `aria-hidden` behavior, keyboard and screen-reader structure, contrast and 200% zoom, then ran `npm test`, `npm run lint`, and `npm run build`.

- **PRD-001.1 — Decide authentication and signup requirements:** Resolved email login, mock auth, signup fields/validation, tab-scoped session behavior, route guards, responsive panel placement, and custom Lottie concepts. PRD-001 is ready for implementation.
- **PRD-001.2 — Build the login screen:** Completed the responsive split layout, email/password validation and visibility toggle, signup link, disabled Google button, and signed-out `/` redirect.
- **PRD-001.3 — Build the signup screen:** Completed the signup route with full name, email, password, confirmation, validation, login navigation, and dashboard entry.
- **PRD-001.4 — Create and integrate auth Lottie animations:** Added custom local login/workspace and signup/career-progress Lottie assets, with static reduced-motion fallbacks.
- **PRD-001.5 — Implement mock session and dashboard routing:** Added valid-format mock login, tab-scoped session marker, route guards, and the initial dashboard welcome state. Passwords are never stored.
