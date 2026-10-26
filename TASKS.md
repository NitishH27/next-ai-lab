# App Tasks

Use this file as the implementation backlog for requirements in `PRD.md`. Codex should review it when asked to find or implement pending app tasks. Add each task under **To Do** with a clear, actionable title, its PRD ID, and a short description of the expected result. Move tasks between sections as their status changes.

## To Do

- **PRD-004.0 — Grill and lock PRD-004 decisions:** Resolved auth (Better Auth + MongoDB adapter, shared cached MongoClient), tab-scoped HTTP-only DB sessions, `migrate-mongo` for indexes, Vercel (Asia Pacific), email verification required, no demo data, separate tracker UI, Google sign-in disabled. Updated PRD-004 to reflect decisions and moved to Ready for Code.

- **PRD-004.1 — Environment and DB foundation:** Add `lib/env.ts` with Zod/env validation (fail-fast on missing `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, optional `MONGODB_DB`), create `.env.example` with placeholders, add `lib/db/client.ts` (cached MongoClient per process, reuse with adapter), `lib/db/connect.ts`, `lib/db/collections.ts`, `lib/db/types.ts`. Mark server-only modules. Document env setup in `README.md`.

- **PRD-004.2 — Migrations (migrate-mongo):** Set up `migrate-mongo` config, create initial migration for required indexes (unique `users.email`, unique `sessions.token`, `sessions.userId`/`sessions.expiresAt` with TTL, applications `{ userId: 1, appliedAt: -1, _id: -1 }` and `{ userId: 1, status: 1 }`). Add npm scripts for migrate up/down, make migrations idempotent. Document commands.

- **PRD-004.3 — Better Auth setup (email+password + email verification + tab-scoped DB sessions):** Configure Better Auth with `@better-auth/mongo-adapter` using shared cached MongoClient. Enable email+password with verification required. Configure tab-scoped sessions (HTTP-only, Secure in prod, SameSite=Lax, Path=/, no Max-Age/Expires). Set trusted origins for dev and Vercel. Add generic login error and field-specific duplicate-email error mapping. Add API route `app/api/auth/[...all]/route.ts`. Create `lib/auth/config.ts`, `lib/auth/server.ts` (use `auth.api.getSession({ headers: await headers() })`), `lib/auth/client.ts`.

- **PRD-004.4 — Auth UI updates (verification flow):** Update signup/login flows to support email verification (inform user to verify email before signing in). Keep validation rules (valid email, >=8 char password, matching confirm). Ensure duplicate email shows field-specific error, login failures show generic message. Keep Google button disabled. Update route behavior for unverified users per Better Auth config.

- **PRD-004.5 — Server session guard & route cutover:** Replace `AuthRoute`/`sessionStorage` with server-side session checks in workspace layout using `auth.api.getSession`. Add/adjust `proxy.ts` for early redirects if needed but do not rely on it for authz. Update redirects: signed-out -> `/login`, signed-in from `/login`/`/signup` -> `/dashboard`, root unchanged. Remove mock session helpers (`lib/auth.ts` mock session code) and update affected specs.

- **PRD-004.6 — Workspace header account area + sign-out:** Add signed-in account display (name/email) and keyboard-operable sign-out control to workspace header (collapse to icon on narrow screens). Sign-out deletes server session, clears cookie, redirects to `/login`. Use `better-ui`, confirm icon via `suggest-lucide-icons` if needed.

- **PRD-004.7 — Applications schema, validation, serialization, repo:** Create `lib/validators/applications.ts` (Zod: trim company/role max 200, valid not-future date, status enum). Create `lib/utils/serialization.ts` (ObjectId->string, Date->ISO). Create server-only repo `lib/repositories/applications.ts` enforcing per-user isolation (`{_id,userId}` filters), deriving userId from session only, rejecting invalid ObjectId as 404, not-found/other-user as 404. Handle statusChangedAt logic (set on create/default, update only on status change).

- **PRD-004.8 — Applications API routes:** Add authenticated routes under `app/api/applications/` (GET list, POST create, GET/PATCH/DELETE `[id]`). Enforce auth (401), validation (400), not found/forbidden cross-user as 404. List newest by `appliedAt` desc with `_id` tie-breaker. Return serialized data. Make routes dynamic/non-cacheable.

- **PRD-004.9 — Dashboard cutover to per-user data:** Replace `getApplications()` usage with server-side read of signed-in user's applications in dashboard (can be Server Component). Remove sample-data notice. Keep `summarizeApplications()` and `getWeeklyApplicationCounts()` unchanged. New accounts see empty state. Ensure no shared caching of authenticated/per-user responses.

- **PRD-004.10 — Security, rate limiting, and hardening:** Configure Better Auth rate limiting for login/signup with 429 + Retry-After, document in-memory limitation. Ensure trusted origins, CSRF/origin checks. Return generic errors (no MongoDB details/stack/secrets), log with context without sensitive data. Add `server-only` imports where appropriate. Verify no secrets in client bundle.

- **PRD-004.11 — Tests (unit + integration) and docs:** Add unit tests for validation, serialization, summary/trend helpers. Add integration tests (signup+verification flow, duplicate email, login success/failure/unverified, tab-scoped session behavior, sign-out, unauthenticated, CRUD + isolation, invalid ObjectId, date serialization). Update route guard tests for server session. Update `ARCHITECTURE.md`, `README.md`, `CHANGLOG.md`. Run `npm test`, `npm run lint`, `npm run build`.

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
