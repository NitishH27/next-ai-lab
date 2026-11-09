# Change Log

This file records repository changes made by Codex, with a dated title and a brief summary for each prompt that changes the project.

## 2026-11-09 — Implement PRD-009 profile personal details

- Added `/profile` with a full-width summary card and a Personal details form for full name, read-only verified email, headline, location, website, and LinkedIn, plus loading and retryable error states. Profile is reached from the top-bar account panel only; the primary navigation stays Dashboard and Applications, and the `/profile` navigation record is metadata-only via `inPrimaryNav: false`.
- Added the `profiles` collection, `DbProfile`, `getProfilesCollection()`, and the immutable `profiles_userId_unique` migration. Saves lazily upsert one owner-scoped document with `$setOnInsert` for `userId`/`createdAt`, retry once on duplicate-key `11000`, and never create a document on read.
- Added shared profile helpers, strict personal-details validation, the server-only repository, and a testable save orchestrator. The Server Action saves profile fields first, updates the canonical Better Auth name only when trimmed input changed, returns the discriminated `saved`/`partial`/`invalid`/`unauthorized`/`error` result, and relies on the new `nextCookies()` plugin to persist the refreshed cached session cookie.
- Added strictly parsed website and LinkedIn URLs, `Include https://` hints, new-tab links with full visible URLs, field-linked errors, first-invalid focus, a `role="status"` save message, a single partial-success `role="alert"`, and `aria-busy` submit handling.
- Moved the shell's `getInitials` into `lib/profile.ts`, added the keyboard-reachable account-panel Profile action, and updated the top-navigation and mobile-menu filters so Profile is not a primary tab.
- Added unit coverage for helpers, validators, repository behavior, save orchestration, navigation, and the migration, plus a separate `test:integration` suite that runs against Atlas `jobflow_test` with a unique collection and cleanup. Updated `PRD.md`, `ARCHITECTURE.md`, `README.md`, `SYSTEM_DESIGN.md`, and `TASKS.md`.
- Validation: `npm test` (64 tests), `npm run test:integration` (2 tests), `npm run lint` (0 errors; 12 pre-existing migration warnings), and `npm run build` pass. Manual browser keyboard, 200% zoom, reduced-motion, and 20rem/48rem responsive checks were not performed because no browser tooling was used; the CSS and DOM were reviewed against the PRD rules instead.

## 2026-11-09 — Sharpen PRD-009 after grilling

- Resolved the profile name-update path: Better Auth `nextCookies()` with the existing `session.cookieCache`, profile-first writes, and partial success when only the name update fails.
- Locked lazy creation for name-only saves (null optional fields), the unique-index race retry, trimmed dirty checks that skip an unchanged name, using server-normalized values after save, the shared `getInitials` helper, UTC `MMM YYYY` member since, strict URL parsing with new-tab links, and a discriminated action result.
- Added the separate `test:integration` script requirement and made the email-verification warning testable through a pure helper.
- Amended PRD-005 in place: `profiles` is the sixth domain collection, seven collections including `changelog`, with the profile schema, unique index, setup checks, and acceptance criteria updated.
- Marked PRD-009 Ready for Code and refreshed its task summary.
- Validation: documentation-only change; no app code, routes, dependencies, or runtime behavior changed, so tests, lint, and build were not re-run.

## 2026-11-09 — Add PRD-009 for profile personal details

- Added PRD-009 to `PRD.md`: a focused first slice of the Profile section where signed-in users view and edit their full name, headline, location, website, and LinkedIn, with email shown read-only and verified.
- Specified the `/profile` route, summary card, personal-details form, lazy profile creation, owner-only server action, `profiles` collection and unique `userId` index, validation and URL rules, loading/error/success states, responsive and accessibility requirements, tests, and documentation updates.
- Linked PRD-009 to PRD-007 and PRD-007.1, added an implementation-phasing note to PRD-007.1, and updated `TASKS.md` so PRD-009 is the first slice and PRD-007.1 keeps the remaining professional, preference, and delete-all phases.
- Validation: documentation-only change; no app code, routes, dependencies, or runtime behavior changed, so tests, lint, and build were not re-run.

## 2026-11-08 — Implement the PRD-008 dark top-nav revamp

- Implemented PRD-008.1–008.5: dark Ink Navy tokens, Plus Jakarta Sans, centered auth, sticky 64px top navigation, dashboard summary/chart, applications grid/drawer, plain empty and loading states, and the `/profile`-ready icon mapping.
- Removed the sidebar and its state/styles, `AuthIllustration`, `lottie-react`, the Lottie JSON files, and the logo JPEGs after reference checks. Kept the grid header at 44px and rows at 48px with inset hairlines so borders do not change layout height.
- Updated `SYSTEM_DESIGN.md`, `PRD.md`, `ARCHITECTURE.md`, `README.md`, `detailedInfo.md`, and `TASKS.md`, and added `lib/design-tokens.spec.mts` to `npm test`.
- Validation: `npm test` (38 tests), `npm run lint` (0 errors; 12 pre-existing migration warnings), and `npm run build` pass. Chrome computed QA at 1280×800, 1024×768, 768×900, 375×812, 320×568, and 640×400 (200% zoom) confirmed the 64px navbar, 44px auth controls, 40px search, 44px add action, 44px grid header, 48px rows, 448px drawer, RTL account panel, Escape/focus return, reduced motion, patterned chart series, and no horizontal overflow; empty dashboard/applications states were verified.

## 2026-11-05 — Upgrade PRD-008 and the design system to a dark top-nav revamp

- Replaced the initial Quiet Paper draft in PRD-008 with a dark-only Ink Navy system: `canvas #0B0F14`, three surface levels, seafoam primary actions, teal accent, cool-grey text, Plus Jakarta Sans, 8/12/16px radii, 44px controls, a 40px applications search exception, 48px grid rows, a 64px top navbar, 72rem content, 24rem auth, and 28rem drawer.
- Moved primary navigation from the sidebar to a sticky top navbar with a text wordmark, horizontal links, account trigger/panel, mobile menu, 180ms active/hover underlines, a 150ms chevron rotation, and 150ms disclosure panels. Removed the sidebar/collapse/flyout/logo-tile direction and kept reduced-motion overrides.
- Reworked auth, dashboard, chart, applications grid, drawer, states, status mapping, icon sizing, and cleanup: centered auth column; five-metric summary strip plus labeled six-status line; “Application activity” with solid/dashed/dotted accent/danger/warning series; 44px grid headers and 48px rows; 6px status dots; no KPI icons, nested cards, decorative shadows, or Lottie.
- Marked PRD-008 Ready for Code and split it into tasks 008.1–008.5; moved 008.0 to Done, added visual-supersession notes to PRD-001/002/003, and updated PRD-007.1 and `TASKS.md` for top-navigation Profile entry points.
- Closed the grilling gaps: root `colorScheme`/`themeColor` metadata, text tokens, `Briefcase`/`CircleUserRound` icon mapping, account accessible name, summary detail copy, 56/40/24rem strip breakpoints, no width animation, and README/`detailedInfo.md` documentation scope.
- Validation: documentation-only change; no app code, routes, dependencies, or runtime behavior changed, so tests, lint, and build were not re-run.

## 2026-11-03 — Add PRD-007.1 for profile section CRUD

- Added PRD-007.1 to `PRD.md`: a focused child requirement for the `/profile` section where signed-in users create, view, edit, and delete personal details, professional details, and job preferences.
- Defined the create/read/update/delete lifecycle: the first save upserts one lazily created profile; section-level saves with no autosave; local tag/entry removal until Save; and a confirmed “Delete profile data” action that removes the profile document (and any future resume file) while keeping the Better Auth account, name, sessions, and applications.
- Specified the persistent top-bar Profile action and sidebar entry, distinct `circle-user-round`/`briefcase` icons, owner-only session-derived reads and writes, PRD-007 validation reuse, empty/loading/error/success states, responsive/accessibility rules, tests, and documentation updates.
- Scoped resume storage, account security, account deletion, matching, and public profiles out of this phase. PRD-007 remains the umbrella and keeps the resume phase.
- Validation: documentation-only change; no app code, routes, dependencies, or runtime behavior changed, so tests, lint, and build were not re-run.

## 2026-11-03 — Move the account profile area into the workspace top bar

- Moved the signed-in account display and sign-out control from the sidebar footer into a persistent top-bar profile panel. The trigger shows initials, name, and email on desktop, keeps the avatar-only control on narrow screens, and opens a panel with the identity summary, verified-email state, and sign-out.
- Added outside-press, Escape, and focus-leave handling; Escape returns focus to the trigger. Removed the duplicate sidebar sign-out and its CSS so the sidebar keeps only navigation and the collapse control.
- Aligned the header title/description and account trigger on one row using the Ocean Depths tokens, an 8px control radius, a 12px popover radius, 44px targets, 0.96 press scale, reduced-motion overrides, and consistent hover/focus states. Amended PRD-007 so the top-bar account panel is the permanent Profile entry point when `/profile` lands.
- Validation: headless Chrome confirmed the header alignment, 8px popover gap, 44px mobile trigger, and no horizontal overflow at 1280px, 375px, and 320px. `npm test` (30 tests), `npm run lint` (0 errors; 12 pre-existing migration warnings), and `npm run build` pass.

## 2026-11-03 — Add the profile, resume, and job preferences PRD

- Added PRD-007 to `PRD.md`: a `/profile` workspace section with editable name and professional details, skills, work experience, education, job preferences, and a single PDF/DOCX resume stored in MongoDB GridFS.
- Documented the new `profiles` collection and unique `userId` index, the GridFS `resumes.files`/`resumes.chunks` collections, the PRD-005 collection-count amendment, server actions and owner-only resume routes, validation and 4 MB upload limits, security and serialization rules, responsive/accessibility requirements, tests, and documentation updates.
- Chose recommended defaults for scope: one lazily created profile per user, initials-only avatars, one active resume with no parsing or versions, and job preferences stored for future matching without changing the dashboard.
- Validation: documentation-only change; no app code, routes, dependencies, or runtime behavior changed, so tests, lint, and build were not re-run.

## 2026-11-01 — Make application rows clickable

- Rows in the applications grid are now the click target: clicking anywhere on a row opens the edit drawer, and Enter or Space on a focused cell does the same. Removed the Actions column and its Edit button now that the row itself handles editing.
- Removed the click and selection styling: selected-row and single-cell range fills are transparent, and the cell focus border no longer draws a dark box when a cell is clicked. Keyboard focus instead shows the standard 2px teal ring, inset into the cell.
- Switched AG Grid to its legacy CSS theming (`theme="legacy"`) so the existing `ag-theme-jobflow` token block is actually applied. The default Theming API had been shadowing those tokens, which is why rows rendered at 25px, headers at 26px, and hover/selection used AG Grid's default colours instead of the Ocean Depths palette.
- Updated `SYSTEM_DESIGN.md` so the row standard says the full row is the click target and rows get no pressed or selected fill.
- Validation: `npx tsc --noEmit` and `npm run build` passed; `npm run lint` reports 0 errors (12 pre-existing warnings in the index migration). A temporary headless-Chrome harness confirmed the grid resolved the Ocean Depths tokens, clicking a row opened it with no selected row or focus box, and Enter on a focused cell opened the row with the 2px teal focus ring.

## 2026-11-01 — Space out dates and refine the applications grid

- Changed the date format from the stuck `DDMMMYY` output to `DD MMM YY` (for example `01 Oct 26`) and render each date as a `<time>` element with a machine-readable `dateTime`, using tabular numerals so the columns align.
- Rebuilt the grid setup as a typed module-level `ColDef<ApplicationRow>[]` with a named renderer for every column (company, role, applied date, status, status changed), a shared cell wrapper, stable `getRowId` values, and a header tooltip where the label needs explanation.
- Upgraded the grid theme with 56px rows, a 48px header, 20px horizontal padding, quieter uppercase headers with hover feedback, visible column-resize handles, a thin internal scrollbar, and truncation that keeps the full value in the native title. Row hover stays the neutral `surface-hover` wash, selection stays transparent, and a small row-end chevron appears on hover or keyboard focus to signal that the row opens.
- Matched the loading skeleton to the new row rhythm and disabled the new transitions under `prefers-reduced-motion`.
- Validation: `npx tsc --noEmit`, `npm run lint` (0 errors, 12 pre-existing migration warnings), and `npm run build` passed. A temporary headless-Chrome harness confirmed the rendered dates (`01 Oct 26`), 56px rows, 48px header, 20px cell padding, transparent click state, and the keyboard focus ring.

## 2026-11-01 — Quiet the interaction styling

- Reworked interactive states around one rule: hover uses a neutral wash, focus is a ring only, and solid navy is reserved for primary actions and the brand tile. Added `surface-hover`, `surface-sunken`, and `border-strong` tokens and removed the seafoam hover fills from the sidebar, form fields, password toggle, and applications grid.
- Styled the previously unstyled workspace sign-out control (account label, sign-out text, collapsed icon and flyout), grouped the sidebar footer behind a divider, and replaced the translucent blurred workspace header with a solid surface.
- Refined the auth card and buttons: 16px card radius, no card shadow, a 0.96 press scale, and a defined `field-success` style. Stat cards and the trend card now use a 1px border without a shadow, and KPI numerals are calmer.
- Rebuilt the applications toolbar, loading skeleton, empty state, status cells, and drawer with shared classes instead of dead Tailwind colour utilities and inline mouse handlers. The drawer now animates, locks background scroll, traps and restores focus, and uses 8px control radii and a 40px close target.
- Stopped rendering an empty dashboard notice and corrected its copy; typed the applications collection so the repository, serialization, and actions no longer rely on `any`.
- Updated `SYSTEM_DESIGN.md` with the interaction-state standard and the new colour tokens.
- Validation: `npx tsc --noEmit` passed, `npm run lint` now reports 0 errors (12 pre-existing warnings in the index migration), and `npm run build` passed. The auth screen was rendered in headless Chrome at 1440×1000 and 390×844 and checked through computed styles and geometry: 460px card with 16px radius and no shadow, 48px inputs and buttons, a 2px teal focus ring, neutral hover, and no horizontal overflow. Screenshots could not be visually inspected by this agent, and the applications and dashboard screens were not rendered because they require a signed-in session.

## 2026-10-31 — Add Beginner-Friendly Project Guide

- Added `detailedInfo.md`, a complete beginner's walkthrough of what Next.js is, how this app uses it, file-based routing, Server vs Client Components, frontend/backend boundaries, Better Auth signup/login/verification flows, MongoDB concepts, the cached connection chain, schema and indexes, end-to-end data flows, validation, environment setup, the folder map, and UI/accessibility standards.
- Documented the current implementation accurately, including where the code differs from older docs (real auth instead of the mock prototype, the pass-through `AuthRoute`, client-side redirects on `/login` and `/signup`, the missing tracker UI, and rate limiting not yet configured).
- Validation: documentation-only change; no app code, routes, or dependencies changed, so lint and build were not required.

## 2026-10-29 — Send Verification Emails on Sign-Up

- Root cause: `emailVerification.sendOnSignUp` was enabled but no `sendVerificationEmail` handler was configured, so Better Auth silently skipped delivery and no email (or link) was produced.
- Added `lib/auth/email.ts` with the verification email copy and a Resend sender (`RESEND_API_KEY`, optional `EMAIL_FROM`). Without a key, development logs the verification URL to the server console; production throws a clear error instead of failing silently.
- Wired the handler into `lib/auth/config.ts` and documented `RESEND_API_KEY`/`EMAIL_FROM` in `.env.example` and the README.
- Added `lib/auth/email.spec.mts` and included it in `npm test`.
- Verified end to end against the running dev server and Atlas: sign-up created an unverified user, the console link verified the account (`emailVerified: true`, token consumed), then the test user was removed.
- Validation: `npm test` passed 29 tests, `npm run lint` passed with warnings only, and `npm run build` completed.

## 2026-10-29 — Connect Local Environment to Atlas and Run Migrations

- Added the Atlas cluster host, database user, and password to the gitignored `.env.local`, split across `MONGODB_URI`, `MONGODB_USER`, and `MONGODB_PASSWORD`; `MONGODB_DB` stays `jobflow_dev` and the generated auth secret is unchanged.
- `npm run db:check` connected to the Atlas cluster and reported the `jobflow_dev` database.
- `npm run migrate:up` applied `20251026000000-init-indexes.js` and `20261029000000-add-auth-indexes.js`.
- Verified the resulting state: `users`, `accounts`, `sessions`, `verification`, `applications`, and `changelog` exist; the unique `users.email`, `accounts.{providerId, accountId}`, `sessions.token`, `applications` compound, and the `sessions.expiresAt`/`verification.expiresAt` TTL indexes are present.
- No application code changed; `TASKS.md` now records the completed live check.

## 2026-10-29 — Implement PRD-005 Database Foundation

- Defaulted `MONGODB_DB` to `jobflow_dev`, required it in deployed environments, and restricted deployed values to the four environment-suffixed database names.
- Added MongoClient `maxPoolSize: 10` and `serverSelectionTimeoutMS: 5000`; aligned `.env.example`, `migrate-mongo-config.js`, `scripts/check-db.mjs`, `README.md`, and `prerequisites.md` with the new database names.
- Configured Better Auth's collection names explicitly (`users`, `accounts`, `sessions`, `verification`), set sessions to 30 days, and set verification tokens to 1 hour.
- Added migration `20261029000000-add-auth-indexes.js` for the unique `{ providerId, accountId }` account index and the `verification.expiresAt` TTL index.
- Added Zod create/update schemas for applications and centralized the future-date guard; the repository now rejects a future `appliedAt` instead of clamping it.
- Added `lib/db/migrations.spec.mts` and expanded `lib/validators/applications.spec.mts`; wired both into `npm test`. Added `zod` as a direct dependency.
- Removed three `as any` casts from the auth forms and `lib/auth/server.ts` so lint has no errors.
- Updated `ARCHITECTURE.md`, `TASKS.md`, and the README project map.
- Created the local, gitignored `.env.local` with `MONGODB_DB=jobflow_dev`, a generated 64-character auth secret, and commented Atlas placeholders.
- Validation: `npm test` passed 26 tests, `npm run lint` passed with warnings only, and `npm run build` completed. Live `db:check` and `migrate:up` were not run because the Atlas URI, user, and password are not filled in.

## 2026-10-29 — Grill and Lock PRD-005 Database Decisions

- Ran the PRD-005 grilling and locked the remaining database and deployment decisions: Atlas `ap-south-1` with Vercel `bom1`, M10+ production, Resend email verification with 1-hour tokens, browser-session HTTP-only cookies with a 30-day server expiry, account deletion deferred past v1, a dedicated `jobflow_preview` database, environment-suffixed database names, in-memory rate limiting for v1, no status-history collection, minimal `applications` with tracker fields deferred to PRD-006, one `readWrite` user per cluster boundary for app and migrations, `0.0.0.0/0` with alerts for v1, 7-day backups, and future `appliedAt` rejected with `400`.
- Updated PRD-005 to **Ready for Code**, replaced its open questions with deferred decisions, and added the locked decisions to its decision table, setup workflow, edge cases, and acceptance criteria.
- Reconciled PRD-004's stale session, network, email, and rate-limit wording with the locked decisions and resolved its open questions except the production trusted-origins configuration.
- Moved **PRD-005.0** in `TASKS.md` to **Ready for Code** and aligned the affected PRD-004 task descriptions.
- No application code changed; no lint, test, or build run was required for this documentation-only change.

## 2026-10-29 — Add Database Setup and Schema PRD

- Added PRD-005 to `PRD.md` as the database companion to PRD-004: environment layout, five domain collections plus the migration `changelog`, field-level schemas, relationships, index inventory, validation boundaries, migration rules, retention and backup decisions, edge cases, acceptance criteria, and open questions.
- Locked the v1 defaults: MongoDB Atlas replica set, separate dev/test/preview/prod databases, production on its own cluster, ObjectId identifiers, UTC BSON dates, string statuses, Better Auth ownership of auth collections, `userId` isolation, no database validators, no counters or status-history collection, and `migrate-mongo` migrations.
- Clarified that a no-Max-Age cookie is browser-session scoped, not truly tab-scoped, and recorded the correction to PRD-004's conflicting session wording as an open question.
- Renumbered the future tracker UI from PRD-005 to PRD-006 in PRD-004's references so the database requirement can take PRD-005.
- No application code changed; no lint, test, or build run was required for this documentation-only change.

## 2026-10-29 — Add MongoDB Environment Configuration

- Added `.env.example` with the required `MONGODB_URI`, `MONGODB_USER`, `MONGODB_PASSWORD`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` placeholders plus the optional `MONGODB_DB`.
- Created a local `.env.local` with a generated auth secret and the Atlas cluster, database user, and password (password kept literal so `@` is not parsed from the URI).
- Passed MongoDB credentials through driver options in `lib/db/client.ts` and `migrate-mongo-config.js` instead of embedding them in the URI.
- Added `npm run db:check` to verify the configured connection.
- Un-ignored `.env.example` in `.gitignore` while keeping real `.env*` files untracked.
- Made `migrate-mongo-config.js` load `.env.local` and `.env` so migrations use the same `MONGODB_URI` as the app.
- Documented environment setup in `README.md` and refreshed `prerequisites.md`.

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

## 2026-10-26 — Make the Workspace Header Sticky

- Made the shared workspace page header sticky at the top of the content column, so the page title and description stay visible while dashboard content scrolls underneath.
- Styled the sticky surface with the sidebar's `surface` token at 90% opacity plus a 12px backdrop blur, keeping the existing `border` divider and `text` heading color.
- Verified `npm run lint` and `npm run build`; no component or navigation behavior changed.

## 2026-10-26 — Require a Changelog Entry for Every Prompt

- Added an Agent Workflow rule to `RULES.md` requiring a dated `CHANGLOG.md` entry for every prompt that changes the project, including small style, documentation, and rule updates.
- Documentation-only change; no application behavior or build output changed.

## 2026-10-26 — Add PRD-004 Backend Foundation Requirement

- Added proposed `PRD-004` for real accounts and per-user application persistence: a managed database and email/password authentication, server-side session guards, HTTP-only cookies, application CRUD endpoints, repository-level isolation, validation, rate limiting, and dashboard cutover from sample data.
- Recorded the compatibility impact: PRD-001's tab-scoped `sessionStorage` session and PRD-002's shared sample records are replaced, while the six statuses, KPI formulas, stale rule, and chart behavior stay unchanged.
- Listed open decisions for the session lifetime, email verification, tracker UI scope, demo data, deployment target, and Google sign-in. No implementation tasks were added until those questions are resolved.
- Documentation-only change; no runtime or build output changed.

## 2026-10-26 — Set MongoDB Atlas as the PRD-004 Database

- Updated `PRD-004` to make MongoDB Atlas mandatory and the native `mongodb` driver the single data-access client, replacing the previous PostgreSQL/Supabase baseline.
- Recommended Better Auth with `@better-auth/mongo-adapter` and database sessions, and documented the `users`, `sessions`, `accounts`, and `applications` collections, ObjectId/Date serialization, index and migration requirements, connection caching, Atlas network access, and production backups.
- Replaced row-level security with a mandatory server-only repository scope because MongoDB has no RLS, and added cross-user isolation, malformed ObjectId, BSON mapping, and Atlas test-database coverage to the acceptance criteria.
- MongoDB Atlas is now fixed; the auth layer, Atlas topology/region, session lifetime, email verification, tracker UI, demo data, deployment target, and Google sign-in remain open questions.
- Documentation-only change; no runtime or build output changed.

## 2026-10-26 — Confirm Cluster-Based MongoDB Atlas

- Clarified `PRD-004` that MongoDB Atlas must be a standard cluster-based deployment (replica set or sharded cluster) reached through its `mongodb+srv://` connection string, not a local-only or non-cluster database.
- Noted that the cluster's transaction support is available to the shared auth adapter, and that production uses a paid Atlas cluster tier with backups.
- Added an acceptance criterion for connecting to the configured Atlas cluster and narrowed the remaining infrastructure question from Atlas topology to cluster tier, region, and database names.
- Documentation-only change; no runtime or build output changed.

## 2026-11-01 — Add PRD-006 Application Tracker

- Added PRD-006 for adding/editing applications with AG Grid list, search, drawer/form per better-ui, dayjs DDMMMYY formatting, no delete for v1.

