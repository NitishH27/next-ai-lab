# Change Log

This file records repository changes made by Codex, with a dated title and a brief summary for each prompt that changes the project.

## 2026-10-16 — Add Repository Contributor Guide

- Added `AGENTS.md` with project structure, development commands, coding conventions, validation guidance, and pull request expectations.

## 2026-10-16 — Add Application Development Rules

- Added `RULES.md` with guidance for Next.js usage, TypeScript style, accessibility, configuration safety, and quality checks.

## 2026-10-16 — Document Application Architecture

- Added `architecture.nd` with the current repository structure and guidance for organizing future app code.

## 2026-10-16 — Require Architecture Review Before App Changes

- Updated `RULES.md` to require reading `architecture.md` before changing app code or creating components, and to update it for lasting architectural changes.

## 2026-10-16 — Require Ponytail Skill for Codex Changes

- Updated `RULES.md` to require Codex to use the ponytail skill for each new change or update.

## 2026-10-16 — Add App Task Backlog

- Added `TASKS.md` as the app implementation backlog, with sections for tasks to do, in progress, and done.

## 2026-10-16 — Add Product Requirements Workflow

- Added `PRD.md` with a requirements template and delivery process from product requirements to implementation tasks and completion.
- Linked `PRD.md` and `TASKS.md` in `RULES.md`, and required tasks to reference their PRD requirement IDs.

## 2026-10-16 — Uppercase Markdown Filenames

- Renamed `architecture.md` to `ARCHITECTURE.md` and `changlog.md` to `CHANGLOG.md`.
- Updated references so documentation links use the uppercase filenames.

## 2026-10-16 — Define Shared UI System

- Added `SYSTEM_DESIGN.md` with proposed color tokens, typography, spacing, layout, component, and accessibility standards.
- Updated `RULES.md` and `ARCHITECTURE.md` to make the design guide part of the component workflow and repository map.

## 2026-10-16 — Require Design System Review for Components

- Clarified in `RULES.md` that Codex must check `SYSTEM_DESIGN.md` before implementing or updating any component to keep the UI consistent.

## 2026-10-16 — Apply Ocean Depths Theme

- Updated `SYSTEM_DESIGN.md` with Ocean Depths color tokens and typography, while retaining the app's existing Geist font as a fallback.

## 2026-10-16 — Specify Authentication Screens and Dashboard

- Added proposed requirement `PRD-001` for login, signup, disabled Google login, dashboard entry, and reduced-motion-aware Lottie animations.
- Added five linked planning tasks to `TASKS.md`; authentication-dependent work is gated on the requirement's open decisions.

## 2026-10-16 — Finalize PRD-001 Prototype Decisions

- Updated `PRD-001` with email-based mock login, validation, signup fields, tab-scoped session behavior, route guards, responsive panel placement, and custom Lottie concepts.
- Marked `PRD-001` ready and moved the completed decision task to **Done** in `TASKS.md`.

## 2026-10-17 — Implement PRD-001 Authentication Prototype

- Added responsive login, signup, and dashboard routes with Ocean Depths styling, form validation, password visibility controls, and a disabled Google sign-in option.
- Added session-scoped mock authentication and client route guards; passwords are never stored.
- Added two custom local Lottie animations with reduced-motion fallbacks, a validation spec, and an offline-safe system font setup.

## 2026-10-22 — Specify Dashboard Status Widgets

- Added proposed requirement `PRD-002` for four dashboard widgets: applications sent, positive responses, rejected, and awaiting review.
- Documented the shared application status model, count helper, mock-data approach, responsive layout, accessibility rules, and open questions about real data source and status definitions.

## 2026-10-22 — Sharpen PRD-002 After Design Review

- Reworked `PRD-002` to five widgets after a design interview: added Offers and split positive responses from offers so no application is double-counted.
- Adopted a six-status model with withdrawn records counted only in Applications sent, and a resolved-response rate that excludes awaiting and withdrawn applications.
- Defined awaiting review as employer silence with a 14-day follow-up flag, kept hardcoded full sample records with dates relative to today, and required a visible sample-data notice.
- Replaced the tautological totals test with explicit invariant, rate, and stale-boundary cases, and recorded the deferred component-spec exception.
- Marked `PRD-002` ready and added four linked tasks to `TASKS.md`.

## 2026-10-22 — Require Task Tracking Through Grilling

- Added `grill-me` workflow rules to `RULES.md`: the linked task starts in **To Do**, moves to **In Progress** when the grilling resolves its open questions, and moves to **Done** after implementation and quality checks.
- Moved the `PRD-002` implementation tasks to **In Progress**, since their grilling is resolved.

## 2026-10-22 — Add Ready for Code Task Stage

- Split the post-grilling stage in `RULES.md`: resolved grilling moves a task to **Ready for Code**, starting implementation moves it to **In Progress**, and finished work with passing checks moves to **Done**.
- Added the **Ready for Code** section to `TASKS.md` and moved the `PRD-002` tasks there.

## 2026-10-22 — Add Widget Icons and Sent Breakdown

- Extended `PRD-002` with decorative top-right icons per card, chosen from the UI guidance icon set and rendered as inline SVG so no icon dependency is added.
- Made Applications sent show all six status counts plus its total, with the card spanning the grid on wide screens.
- Updated the linked `PRD-002.2` and `PRD-002.4` tasks to include the icons, breakdown, and keyboard/screen-reader validation.

## 2026-10-22 — Require Lucide Icons and better-ui Polish

- Added rules to `RULES.md`: confirm every icon with the `suggest-lucide-icons` skill and use `lucide-react` as the single icon source; apply the `better-ui` skill to every new or changed component.
- Moved the `PRD-002` card icons to the top-left, replaced the provisional set with verified Lucide names (`send`, `message-circle-check`, `award`, `circle-x`, `clock`), and specified 20px sizing, 2px absolute stroke, 8px gap, token colors, RTL mirroring for `send`, and no icon animation.
- Updated the linked dashboard tasks for the icon library and alignment validation.

## 2026-10-22 — Fit Five KPI Cards in the Top Half

- Relaxed the `PRD-002` icon rule: no mandated corner, the icon leads the card header beside the label per the UI guidance, with `better-ui` optical alignment.
- Changed the layout to one row of five compact KPI cards at 1024px and wider, sized so the heading, notice, and widgets end inside the top 50% of a 1280×800 viewport, following the Executive Dashboard KPI guidance.
- Replaced the full-width Applications sent card with a compact two-column six-status breakdown and a 240px card height budget at 1280×800.
- Updated the linked layout, icon, and validation tasks.

## 2026-10-23 — Implement PRD-002 Dashboard Widgets and Trend Chart

- Added the five dashboard KPI cards (Applications sent, Positive responses, Offers, Rejected, Awaiting review) with Lucide icons, the six-status sent breakdown, resolved response rate, stale follow-up flag, and sample-data and empty states.
- Added `lib/applications.ts` with the six-status model, relative-date seed records, `getApplications()`, `summarizeApplications()`, and `getWeeklyApplicationCounts()`, plus `lib/applications.spec.mts` covering the invariant, rate, stale boundary, weekly buckets, and seed data.
- Added the Recharts trend card below the widgets with three 12-week series — Applied (`accent`), Rejected (`danger`), and Interview (`success`) — a matching legend, tooltip, empty-window state, and a visually hidden data table.
- Expanded the seed to 19 records spread across the 12-week window so each plotted series has several points, and kept the five widgets inside the top half of a 1280×800 viewport with the chart fully visible below.
- Marked `PRD-002` complete and moved `PRD-002.5` and `PRD-002.6` to **Done**; verified `npm test`, `npm run lint`, and `npm run build`.

## 2026-10-23 — Add PRD-003 Shared Workspace Layout

- Added `PRD-003` for a signed-in workspace shell with a fixed 240px/72px collapsible sidebar, one shared page-title header driven by `lib/navigation.ts`, and the provided expanded and collapsed JobFlow logo marks.
- Scoped the shell to signed-in workspace routes, kept login, signup, and the root redirect on their existing full-screen auth layout, and documented the route-group, accessibility, responsive, and navigation-config requirements.
- Noted the PRD-002 compatibility impact: the welcome heading moves into the shell description, card breakpoints follow the content area, and the 1280×800 top-half budget must be revalidated with the sidebar open.
- Added four linked `PRD-003` tasks in `TASKS.md`; no application code changed in this pass.

## 2026-10-23 — Grill PRD-003 Workspace Shell

- Resolved the grilling questions: the shell stays on signed-in routes only, navigation lists only existing pages, and the dashboard page title is `Dashboard` with `Welcome to dashboard.` as its description.
- Changed the sidebar from dark navy to a light `surface` rail with a divider border, dark navy rounded tiles behind the supplied logo JPGs, muted unselected nav icons, and a navy active pill with reversed cream icon and label.
- Kept the existing `expandedLogo.jpg` and `collapsedLogo.jpg` filenames, retained the 240px/72px widths, kept the 72px collapsed rail with the toggle hidden below 768px, and confirmed the collapse choice resets on reload.
- Chose to lower the Applications sent breakdown container threshold for the sidebar-constrained card width instead of narrowing the sidebar or relaxing PRD-002's 1280×800 top-half budget.
- Moved the grilling task to **Done**, returned the four implementation tasks to **Ready for Code**, and marked PRD-003 ready for implementation.

## 2026-10-23 — Make PRD-003 Fluid and Responsive

- Replaced the fixed 240px/72px sidebar with a two-column workspace grid using `clamp(13rem, 18%, 15rem)` expanded and `clamp(4.5rem, 5.6%, 5rem)` collapsed columns, keeping the rail visible with sticky positioning.
- Replaced the fixed 200px breakdown threshold with an 11rem card-container query and moved the KPI column count to content-area container queries, so the 1280×800 five-card row no longer conflicts with the sidebar width.
- Converted layout guidance to `%`, `fr`, `rem`, and `clamp()`; reference viewport sizes remain test conditions only. The logo tiles, collapse control, and breakpoints now use relative units.
- Added the PRD-002 layout amendment and updated the linked `PRD-003.2`–`003.4` tasks. No application code changed.

## 2026-10-23 — Default the Sidebar to Expanded

- Changed the sidebar to a single client `isSidebarCollapsed` boolean defaulting to `false`, so the rail starts expanded on every full load and survives route changes within the mounted workspace layout.
- Removed the 48rem–63.99rem collapsed default; the sidebar now starts expanded from 48rem and wider.
- Kept the forced collapsed rail below 48rem as a visual override that does not rewrite the state, so the expanded default returns when the viewport grows back.
- Updated the PRD-003 requirements, acceptance criteria, and linked tasks. No application code changed.

## 2026-10-23 — Specify Sidebar Icons and Ocean Depths States

- Confirmed the sidebar Lucide names through `suggest-lucide-icons`: `layout-dashboard` for the Dashboard nav item, `panel-left-close` when expanded, and `panel-left-open` when collapsed. All three exist in the current Lucide set.
- Mapped every sidebar state to an Ocean Depths token: `surface` rail, `border` divider, `text-muted` unselected content, `surface-accent`/`text` hover and focus, `primary`/`canvas` current pill with `primary-hover` hover, `focus` ring, and `primary` brand tiles.
- Applied `better-ui`: 20px icons with a 2px absolute stroke and 8px gap, hover only under `@media (hover: hover)`, 150ms named color transitions, 0.96 press scale, 2px focus rings, `overscroll-behavior: contain`, 8px/12px radii, no `transition: all`, and a reduced-motion override.
- Changed the expanded collapse control from a 44px square to a full-width 44px-tall row with a visible “Collapse sidebar” label; the collapsed control stays a 2.75rem square with a flyout label on hover and focus.
- Specified instant panel-icon swaps, RTL mirroring for the panel icons, and no icon animation beyond the existing column transition.
- Updated the PRD-003 requirements, acceptance criteria, and linked tasks. No application code changed.

## 2026-10-24 — Implement PRD-003 Workspace Shell and Sidebar

- Moved the dashboard into `app/(workspace)/dashboard/page.tsx` and added `app/(workspace)/layout.tsx` with the shared `AuthRoute` guard, so login, signup, and the root redirect stay outside the shell.
- Added `lib/navigation.ts` and `lib/navigation.spec.mts` as the single workspace navigation/title source, and wired the spec into `npm test`.
- Added `components/layout/WorkspaceShell.tsx` with the sticky light rail, expanded and collapsed logo tiles, route-aware primary nav, Ocean Depths hover/focus/active states, collapsed flyouts, compact header, skip link, and the in-memory expanded default.
- Implemented the fluid `clamp()` sidebar, 200ms column transition, 150ms token-color transitions, 2px focus rings, 0.96 press scale, hover-only styles, RTL logical layout and icon mirroring, and reduced-motion overrides.
- Replaced the dashboard's fixed card breakpoints with content-area container queries and a 9rem content-box breakdown threshold; verified the 1280×800 five-card row, 320px stacking, keyboard focus/tooltips, RTL geometry, reduced motion, and token contrast.
- Kept component DOM specs deferred under the PRD-002/PRD-003 exception; `npm test`, `npm run lint`, and `npm run build` pass.
