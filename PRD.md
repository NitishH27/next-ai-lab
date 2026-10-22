# Product Requirements

Use this document to capture product requirements before implementation. Keep requirements specific enough to define the user need and expected outcome. Codex should not treat an idea in this file as authorization to implement it unless asked to work on it.

## Requirement Template

For each feature, add a section with:

- **ID and title:** A stable identifier (for example, `PRD-001`) and concise name.
- **Status:** Proposed, ready, in progress, or complete.
- **Problem and users:** Who needs this and what problem it solves.
- **Requirements:** Expected behavior, including important constraints and edge cases.
- **Acceptance criteria:** Observable conditions that show the requirement is satisfied.
- **Open questions:** Decisions that still need answers, if any.

## Delivery Process

1. Add and refine requirements here. Resolve open questions before marking a requirement ready.
2. Break each ready requirement into small, verifiable implementation tasks in `TASKS.md`. Reference the PRD ID in every task.
3. When asked to implement work, check `TASKS.md`, `RULES.md`, and `ARCHITECTURE.md`; follow the ponytail skill and the project architecture.
4. Implement tasks, run the relevant quality checks in `RULES.md`, and move completed tasks to **Done** in `TASKS.md`.
5. Update this PRD's status and acceptance criteria, and record the change in `CHANGLOG.md`.

## Requirements

### PRD-001 — Authentication Screens and Dashboard Entry

- **Status:** Complete
- **Problem and users:** New and returning JobFlow users need a clear way to create an account, sign in, and reach their dashboard.
- **Requirements:**
  - Create a login screen with a two-tone desktop layout: a dark branding panel occupies 30% on the left and a neutral/surface panel occupies 70% on the right, containing the login form in a distinct box. On mobile, collapse the dark panel to a short header above the form.
  - Use email and password fields. Hide the password by default and include a show/hide control. Provide a Login button.
  - Validate email format and require a password of at least 8 characters, with no forced uppercase, number, or symbol. This prototype accepts any credentials that pass these format checks and displays clear validation errors otherwise.
  - Include a “New user? Sign up” link to the signup page.
  - Show a “Login with Google” button, disabled until real Google authentication is implemented.
  - Provide a signup page with full name, email, password, and confirm password fields. Hide passwords by default, provide show/hide controls, validate email, require at least 8 password characters, and require the password confirmation to match.
  - On successful mock signup, sign the user in and route to the dashboard. On successful mock login, route to the dashboard. The dashboard displays “Welcome to dashboard”.
  - Store only a mock signed-in marker in `sessionStorage`: preserve it through refreshes in the current tab and end it when that tab session ends. Never store the password.
  - Route signed-out users from `/` to `/login` and from `/dashboard` to `/login`. Route signed-in users away from `/login` and `/signup` to `/dashboard`.
  - Add two custom local Lottie animations: a sign-in/workspace motif for login and a career-progress motif for signup. Place them in the dark branding panel. Use calm Corporate motion, keep it subtle and non-blocking, and honor `prefers-reduced-motion` with a static fallback.
  - Follow `SYSTEM_DESIGN.md` for Ocean Depths colors, typography, spacing, responsiveness, and accessibility.
- **Acceptance criteria:**
  - Desktop uses a 30% dark left branding panel and a 70% neutral right form panel; mobile uses a short dark header above the form.
  - `/` sends signed-out users to `/login`. Signed-out access to `/dashboard` redirects to `/login`; signed-in access to `/login` or `/signup` redirects to `/dashboard`.
  - Login accepts any syntactically valid email and password of at least 8 characters. Invalid entries show clear errors and do not navigate. Password is hidden by default and can be revealed.
  - Signup collects full name, email, password, and confirmation. It validates email, minimum password length, and matching confirmation; successful signup creates the mock session and opens the dashboard.
  - Mock login/signup state survives refresh in the current tab via `sessionStorage`; passwords are never stored.
  - Google login is visibly disabled until real Google authentication is implemented.
  - Dashboard displays “Welcome to dashboard”.
  - Each auth screen has its specified custom Lottie animation, with a static reduced-motion fallback; animations do not block form access.
  - Layout and controls remain usable by keyboard and on mobile, and meet the accessibility rules in `SYSTEM_DESIGN.md`.
- **Open questions:** None for the mock prototype. Real authentication and enabling Google sign-in are future work.

### PRD-002 — Dashboard Application Status Widgets

- **Status:** Ready (prototype scope; real tracker dependency noted below)
- **Problem and users:** Job seekers using JobFlow can sign in, but the dashboard currently shows only a welcome message, so they cannot tell at a glance how their search is going or where to follow up. They need a summary of applications sent, positive responses, offers, rejections, and applications still waiting on an employer.
- **Requirements:**
  - Show five summary widgets on `/dashboard`, below the existing welcome heading:
    - **Applications sent** — every application submitted, including withdrawn ones. Shows the total plus a breakdown of all six statuses with their counts, so the card explains where the total comes from. No rate.
    - **Positive responses** — applications currently in screening or interview (pre-offer). Shows the count plus the resolved response rate.
    - **Offers** — applications currently at offer stage. Shows the count plus the resolved response rate.
    - **Rejected** — applications that ended in rejection.
    - **Awaiting review** — applications still at `applied`, meaning the employer has not responded. The supporting line flags any that are 14 or more days old as needing follow-up.
  - Store one status per application, from a six-value model: `applied | screening | interview | offer | rejected | withdrawn`. An application is never counted in two widgets.
  - Counting rules: `sent` is every record. `positive` is screening + interview, deliberately excluding offers so offers are not double-counted. `offers` is offer. `rejected` is rejected. `awaiting` is applied. `withdrawn` appears only inside `sent`. The invariant is `positive + offers + rejected + awaiting + withdrawn = sent`.
  - Response rate is `(positive + offers) / (positive + offers + rejected)`, rounded to a whole percent and shown on the Positive responses and Offers cards as “N% of resolved”. Awaiting and withdrawn applications are excluded from the denominator because neither is an outcome yet. When resolved count is 0, show “—” instead of a percentage.
  - Stale follow-up rule: an application is stale when its status is `applied` and 14 or more whole days have passed since `appliedAt`. Stale applications stay in the awaiting count; the secondary line reports how many need follow-up. Pair the warning with a text label, not color alone.
  - Data source for this iteration is hardcoded sample data in `lib/applications.ts`, shaped as full records: `id`, `company`, `role`, `appliedAt` (ISO date), `status`, `statusChangedAt` (ISO date). Widgets ignore company/role except as realistic seed content.
  - Compute seed `appliedAt` dates relative to the current day (for example 2, 5, 9, 16, and 30 days ago) so the stale flag demos correctly instead of every sample application turning overdue as the dates age.
  - Expose one accessor, `getApplications()`, and one pure summary function, `summarizeApplications(applications, now)`, returning `sent`, `positive`, `offers`, `rejected`, `awaiting`, `withdrawn`, `stale`, `resolved`, and `responseRate` (`number | null`). Widgets read only the summary; no counting logic is duplicated in components.
  - While data is hardcoded, show a visible sample-data notice above the widgets: “Sample data — not connected to your applications yet.” Do not present seed numbers as the user’s own data.
  - Empty dataset behavior: all five widgets render at 0, the rate shows “—”, the sample notice is replaced by one empty message (“No applications yet. Application tracking is coming next.”), and no link or button is shown because no applications page exists to open.
  - Widgets are static and not interactive in this requirement. No hover or focus affordance that implies a destination. Clicking through to an application list is deferred to a separate requirement.
  - Layout: five KPI cards in one row at 1024px and wider, so the dashboard heading, sample notice, and all five widgets fit inside the top 50% of the viewport at 1280×800 and above. This follows the Executive Dashboard guidance of 4–6 KPI cards in a one-page-at-a-glance view. Below 1024px the cards wrap to two per row and then one per row, and the top-half rule does not apply because the page scrolls.
  - Keep cards compact enough for that half-screen budget: the Applications sent breakdown uses a two-column status list (three rows) whenever the card is 200px or wider and a single column below, and no card exceeds 240px tall at 1280×800.
  - Each card shows a decorative Lucide icon — `send` for Applications sent, `message-circle-check` for Positive responses, `award` for Offers, `circle-x` for Rejected, and `clock` for Awaiting review. Placement is not fixed to a corner: the icon leads the card header beside the label, the position least likely to collide with a long label or displace the count. Nudge it optically per `better-ui` rather than hard-coding absolute offsets. Add `lucide-react` as the single icon library for the app and import only those five icons; do not hand-draw SVGs or mix a second icon set.
  - Icon geometry follows `better-ui`: 20px artwork in a non-shrinking 20×20 box, 8px gap to the label, vertically centered with the 14px/500 label, and `absoluteStrokeWidth` at 2px so the stroke matches the label weight instead of thinning when scaled from Lucide’s 24px grid. Never absolutely position the icon, and never let it shift the count’s alignment.
  - Icon color comes from the existing tokens through `currentColor`: `accent-text` for Applications sent, `success` for Positive responses, `accent` for Offers, `danger` for Rejected, and `text-muted` for Awaiting review, switching to `warning` only when its stale-follow-up line is shown. Icons are `aria-hidden="true"` because every card has a visible label, and they never carry meaning alone.
  - Mirror the directional `send` icon under `dir="rtl"` with a horizontal scale flip; leave the other four unflipped because their meaning does not follow reading direction.
  - Icons and cards are static: no hover recolor, transition, or press animation, because nothing on the card is interactive.
  - The Applications sent breakdown lists all six statuses — applied, screening, interview, offer, rejected, withdrawn — each as a label plus a tabular-numeral count. It must render long labels on one line rather than wrapping mid-label, stay readable at 200% zoom, and use the compact two-column layout described above so the card stays inside the height budget.
  - Presentation follows `SYSTEM_DESIGN.md`: Ocean Depths tokens, existing card and eyebrow patterns, 12px card radius, 16–24px card padding, 8px/4px spacing scale. Use semantic list markup with a section heading, label before count, tabular numerals for values, and a status icon or text alongside every status color. Meet WCAG AA contrast and remain readable at 200% zoom. Keep the count as the largest element; the icon is supporting emphasis only and must not compete with the number.
  - No changes to authentication, session behavior, route guarding, or the welcome heading. The dashboard route remains client-side because of the existing auth guard.
  - Tests: add `lib/applications.spec.mts` using the existing `node:test` pattern and extend the `test` script to run it. Cover: empty input, only-awaiting input, a mixed set, the invariant including withdrawn applications, rate math with awaiting and withdrawn excluded, “—” (`null`) when nothing is resolved, and the stale boundary at 13 versus 14 days.
  - Component-level specs are explicitly deferred because no DOM test runner is installed. Record this as a documented exception to the `AGENTS.md` “spec for all new components” rule rather than silently skipping it.
- **Acceptance criteria:**
  - `/dashboard` for a signed-in user shows five widgets — Applications sent, Positive responses, Offers, Rejected, Awaiting review — plus the sample-data notice.
  - All values come from `summarizeApplications` over the seed records; changing one seed status changes the affected cards and keeps the invariant intact with no other code change.
  - `positive + offers + rejected + awaiting + withdrawn = sent` holds for the sample data and for the helper’s test fixtures.
  - Rates match the formula, exclude awaiting and withdrawn, are rounded to whole percents, and show “—” when no application is resolved.
  - Only `applied` records 14 or more days old are flagged for follow-up; a 13-day-old application is not flagged, and flagged records still count toward Awaiting review.
  - The sample-data notice is visible while data is hardcoded and absent when the dataset is empty, in which case the empty message appears and all five widgets show 0 with a “—” rate.
  - The Applications sent card shows its total and all six status counts; the six counts add up to that total.
  - Every card shows its specified Lucide icon as the leading element of the card header beside the label, at 20px with a 2px absolute stroke, 8px gap, and no layout shift between cards. No corner placement is mandated.
  - Icon strokes, box size, gap, and vertical centering match `better-ui`; icons are hidden from assistive technology, are not the only status signal, and carry no hover or press effect. `send` mirrors under RTL and the other four do not.
  - Counts remain the most prominent element on each card; icons and supporting lines sit below that visual weight.
  - Cards are static: no links, buttons, or pointer/hover affordance.
  - At 1280×800, the dashboard heading, sample notice, and all five widgets end above the 50% viewport line (400px), and no card is taller than 240px.
  - At 1024px and wider the five cards sit in a single row; below 1024px they wrap to two per row and then one per row. No horizontal scrolling at 320px, no fixed widths, and no breakdown clipped or wrapped mid-label.
  - Keyboard and screen-reader users reach every widget and hear its label with its count; status meaning never depends on color alone; contrast and zoom meet `SYSTEM_DESIGN.md`.
  - `npm test` runs both specs and passes; `npm run lint` and `npm run build` pass.
  - Authentication, session markers, and route guarding behave exactly as before PRD-002.
- **Deferred dependency — application tracker:** Real per-user application data requires an add/edit/status tracker (local storage or API) that does not exist yet. When it lands, replace `getApplications()`, remove the sample-data notice, and keep the summary helper signature and widget components unchanged. That dependency is not part of PRD-002.
- **Open questions:** None blocking prototype work. Deferred product questions: whether counts should later filter by time period or job board, and whether withdrawn applications ever get their own widget.
