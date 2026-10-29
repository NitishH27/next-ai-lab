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

- **Status:** Complete (prototype scope; real tracker dependency noted below)
- **Layout amendment (PRD-003):** The dashboard now lives inside the shared workspace shell. The 1024px viewport rule and the 200px breakdown threshold below are superseded by content-area container queries and a 9rem content-box breakdown threshold (about an 11rem outer card). PRD-002's data rules are unchanged.
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
  - Compute seed `appliedAt` dates relative to the current day, spread across the 12-week chart window with several records in each plotted status, so the stale flag and the trend chart both demo correctly instead of every sample application turning overdue as the dates age.
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
  - Add a trend card below the five widgets: a full-width line chart titled “Applications sent” with the subtitle “Last 12 weeks · N tracked”, plotting three weekly series — applied, rejected, and interview — from the same records as the widgets.
  - Build the chart with `recharts` as the app’s single chart library, inside the existing client dashboard. Do not hand-roll a parallel chart or add a second chart package.
  - Weekly buckets are 12 trailing 7-day windows ending today, ordered oldest first. Each record contributes to the applied, rejected, or interview series using its current status, bucketed by its `appliedAt`; screening, offer, and withdrawn records are not plotted. Records older than 84 days or dated in the future are excluded. Labels use a short month and day (for example “Aug 3”), the y-axis starts at 0, and ticks use whole numbers only.
  - Series colors come from the Ocean Depths tokens: applied uses `accent`, rejected uses `danger`, and interview uses `success`. Show a visible legend with the three labels and matching swatches so the series are never distinguished by color alone.
  - Keep the one-viewport budget: at 1280×800 the five widgets stay fully inside the top half (ending above 400px) and the trend card follows below them, fully visible with no vertical page scroll. The chart body is `clamp(220px, 34svh, 340px)` tall; below 1024px the card stacks after the widgets and the page may scroll.
  - Chart styling follows the card pattern and Ocean Depths tokens: three 2px lines with matching small dots, border-token grid lines, muted axis labels, and a surface tooltip with rounded corners. Disable mount animation. Hovering a week shows the status counts for that week; the chart has no click behavior.
  - Accessibility: wrap the chart in a figure with a visible caption, hide the decorative SVG from assistive technology, and provide a visually hidden table of all 12 week labels with their applied, rejected, and interview counts. The legend, axis labels, and table carry the values; the lines and colors are never the only signal.
  - Empty window: when no applied, rejected, or interview application falls inside the last 12 weeks, keep the card and show “No applied, rejected, or interview applications in the last 12 weeks.” instead of the plot.
  - No changes to authentication, session behavior, route guarding, or the welcome heading. The dashboard route remains client-side because of the existing auth guard.
  - Tests: add `lib/applications.spec.mts` using the existing `node:test` pattern and extend the `test` script to run it. Cover: empty input, only-awaiting input, a mixed set, the invariant including withdrawn applications, rate math with awaiting and withdrawn excluded, “—” (`null`) when nothing is resolved, the stale boundary at 13 versus 14 days, and the weekly trend helper’s 12 ordered buckets, 7-day boundaries, exclusion of out-of-window and future records, multiple records in one week, empty input, and seed coverage.
  - Component-level specs are explicitly deferred because no DOM test runner is installed. Record this as a documented exception to the `AGENTS.md` “spec for all new components” rule rather than silently skipping it.
- **Acceptance criteria:**
  - `/dashboard` for a signed-in user shows five widgets — Applications sent, Positive responses, Offers, Rejected, Awaiting review — plus the sample-data notice and the applications trend chart below them.
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
  - The trend card sits directly below the widgets, is fully visible without vertical page scroll at 1280×800, and shows 12 weekly buckets across three lines with a visible “Applications sent” / “Last 12 weeks” heading.
  - The visible legend lists Applied, Rejected, and Interview, with swatches using `accent`, `danger`, and `success` respectively; each line and its swatch use the same token color.
  - Each record contributes to the series matching its current status and its trailing 7-day window; records older than 84 days or in the future are excluded, and a tooltip shows the week and per-status counts on hover.
  - The chart is rendered with `recharts`, has no mount animation or click behavior, and exposes a visually hidden 12-row table with week, applied, rejected, and interview columns plus a visible caption.
  - When the last 12 weeks contain no applied, rejected, or interview records, the card keeps its height and shows “No applied, rejected, or interview applications in the last 12 weeks.” instead of the plot.
  - At 1024px and wider the five cards sit in a single row; below 1024px they wrap to two per row and then one per row. No horizontal scrolling at 320px, no fixed widths, and no breakdown clipped or wrapped mid-label.
  - Keyboard and screen-reader users reach every widget and hear its label with its count; status meaning never depends on color alone; contrast and zoom meet `SYSTEM_DESIGN.md`.
  - `npm test` runs both specs and passes; `npm run lint` and `npm run build` pass.
  - Authentication, session markers, and route guarding behave exactly as before PRD-002.
- **Deferred dependency — application tracker:** Real per-user application data requires an add/edit/status tracker (local storage or API) that does not exist yet. When it lands, replace `getApplications()`, remove the sample-data notice, and keep the summary helper signature and widget components unchanged. The trend chart groups records by their current status, not historical status transitions, so accurate historical trends also wait on status-change history from the tracker. That dependency is not part of PRD-002.
- **Open questions:** None blocking prototype work. Deferred product questions: whether counts should later filter by time period or job board, and whether withdrawn applications ever get their own widget.

### PRD-003 — Shared Workspace Layout and Collapsible Sidebar

- **Status:** Complete
- **Problem and users:** Signed-in job seekers need a stable frame that shows where they are and lets them move between sections without every page rebuilding its own navigation and heading. Today `/dashboard` is the only signed-in page and owns its own header, so each new folder would duplicate the auth guard, layout, and title code. Users also need the JobFlow identity to stay visible and a sidebar that can shrink when they want more room for application data.
- **Scope decision:** The shared shell applies to every signed-in workspace route. Today that is `/dashboard`; future routes join it by living under the workspace route group. `/login`, `/signup`, and the `/` redirect stay outside the shell because they are full-screen pre-authentication screens, and a persistent app sidebar would conflict with PRD-001's split branding layout.
- **Compatibility note:** PRD-003 changes two presentation details from PRD-002: the dashboard heading moves into the shell header (with the welcome copy retained as its description), and the card breakpoints are measured against the workspace content area instead of the full viewport, using fluid relative units and container queries rather than fixed pixel thresholds. PRD-002's counts, formulas, icons, and chart behavior do not change.
- **Requirements:**
  - Add a workspace route group at `app/(workspace)/` with a shared `layout.tsx`, and move `app/dashboard/page.tsx` to `app/(workspace)/dashboard/page.tsx`. The public URL stays `/dashboard`. Every future signed-in folder must live under this group so it inherits the shell automatically.
  - Render the existing authentication guard once in the workspace layout instead of wrapping each page. Signed-out users still go to `/login`, signed-in users still skip `/login` and `/signup`, and the root `/` redirect is unchanged.
  - Keep the root layout as the plain HTML shell. The workspace layout owns the sidebar, the page header, the skip link, and the `<main>` content region; pages provide only their content.
  - Create one framework-agnostic navigation source, `lib/navigation.ts`, exporting typed workspace page records (`href`, `label`, `title`, optional `description`) and a pure title resolver. The sidebar and the shell header must read this same source; do not keep a second label or title map in components. Today the only entry is `/dashboard` with label and title `Dashboard` and description `Welcome to dashboard.`
  - Render exactly one `h1` per page, in the shell header, from the matched navigation record. The header is a compact row at 48rem and wider: page title plus the optional description on the same line, with a 1px bottom border. On narrower screens the description may sit below the title. Remove the dashboard's own eyebrow and heading markup. When a workspace path has no record, fall back to the title `JobFlow` rather than rendering a blank heading.
  - The workspace shell is a two-column grid: the sidebar column plus a `minmax(0, 1fr)` content column. The sidebar is sticky at the inline-start edge with a `100svh` height, so it stays visible while page content scrolls. It uses the light `surface` background with a 1px `border` on its inline end, `text` for labels, and logical inline properties so it mirrors correctly under `dir="rtl"`. Keep the rail light rather than deep navy so it matches the app canvas and auth surfaces.
  - Use fluid widths rather than fixed pixel sidebar widths. The expanded column is `clamp(13rem, 18%, 15rem)` and the collapsed column is `clamp(4.5rem, 5.6%, 5rem)`, so the rail scales with the viewport and stops at an accessible minimum and a comfortable maximum. Use 1rem inline padding when expanded and 0.5rem when collapsed so the brand tiles and the 2.75rem control fit inside the minimum rail widths. The grid content column has `min-width: 0` so cards and the chart can shrink without horizontal page scrolling. The sidebar nav area may scroll independently when items exceed the viewport; the brand and collapse control stay reachable.
  - The sidebar contains, in order: the JobFlow brand mark, a primary `<nav aria-label="Primary">` of route links, and a collapse control pinned at the bottom. Only routes that exist may appear; do not add disabled or “coming soon” links that imply pages which do not exist. Use `surface` for the rail, `border` for its 1px inline-end divider, and `text` as the base label color. Unselected links use `text-muted` for icon and label, with a `surface-accent` background and `text` content on hover or keyboard focus. The current route uses `aria-current="page"` and reverses that treatment: a `primary` navy pill with `canvas` cream icon and label, and a 600 label weight instead of 500. On hover, the current pill uses `primary-hover` and keeps the cream content, so the hover style never overrides the selected style. The active state never relies on color alone.
  - Use `lucide-react` as the single icon library on the rail and import only `layout-dashboard` for the Dashboard nav item, `panel-left-close` for the expanded collapse control, and `panel-left-open` for the collapsed control. These names are confirmed through `suggest-lucide-icons`; do not substitute a second icon set, hand-draw SVGs, or invent icon names. Render the nav and panel icons at 20px in a non-shrinking 20×20 box with an 8px gap to the label, `absoluteStrokeWidth` at 2px, and `currentColor`, matching the PRD-002 card icons. All three icons are decorative (`aria-hidden="true"`) because the visible or screen-reader-only label names the link or button. Mirror `panel-left-close` and `panel-left-open` horizontally under `dir="rtl"` because the rail sits at the inline-start edge; leave `layout-dashboard` unmirrored because its meaning does not follow reading direction. Swap the panel icon instantly with the state rather than cross-fading it; the column transition is the feedback, and a second motion would feel laggy. Never absolutely position an icon, and never let it shift the label's alignment.
  - Use the two provided JobFlow marks with their current filenames: the expanded wordmark at `public/images/expandedLogo.jpg` (the `jobflowexpanded` asset, 1774×887) when the sidebar is expanded, and the compact mark at `public/images/collapsedLogo.jpg` (the `jobflowcollapsed` asset, 1254×1254) when it is collapsed. Render only the active mark; the inactive image must not be visible or exposed to assistive technology.
  - Both JPEGs have a dark navy background, so place each mark inside a matching dark navy rounded brand tile (`primary`, 0.75rem radius) on the light rail. Preserve each logo's intrinsic aspect ratio: the expanded mark fits a 10×5rem area inside an 11×6rem tile, and the collapsed mark fits a 2.5rem square inside a 3.5rem square tile. Size the tiles with `min(100%, …)` and give them a 0.5rem inset, with the image using `object-fit: contain`. Never stretch, crop, or force the dark JPEG directly onto the white rail without its tile.
  - Make the brand tile a link to `/dashboard` with the accessible name “JobFlow dashboard”. Give the tile a `primary` background at rest and `primary-hover` on hover or keyboard focus, with the 2px `focus` ring on the link; do not recolor, cross-fade, or animate the JPEG itself. Give the inner image an empty `alt` so the name is not announced twice. If the brand is ever rendered without a link, use the alternative text “JobFlow”.
  - The collapse control is an accessible 44px-tall target with `aria-expanded` and `aria-controls` pointing at the sidebar. Expanded, it is a full-width footer row with a 2.75rem minimum height, a `panel-left-close` icon, an 8px gap, and the visible label “Collapse sidebar”; collapsed, it is a 2.75rem square icon-only button using `panel-left-open`, with the accessible name “Expand sidebar” and a visible flyout label on hover and keyboard focus. Toggle labels and accessible names are always present, even when the visual text is hidden. At rest the control uses `text-muted` on `surface`; on hover or focus it gets a `surface-accent` background with `text` content and the standard 2px `focus` ring at 2px offset. The 44px target is the minimum, not a maximum: never shrink it in the expanded row.
  - Track the sidebar with one client boolean, `isSidebarCollapsed`, defaulting to `false` so the rail starts expanded wherever it is expandable. The state survives client-side route changes because the layout stays mounted, and a full reload returns to expanded. Do not add storage for this prototype.
  - Responsive behavior: at 48rem and wider the sidebar defaults to expanded and the toggle is available; below 48rem it is forced to the collapsed rail and the toggle is hidden. Derive an effective collapsed value from `isSidebarCollapsed` plus the compact-viewport override, and render the width, logo, and toggle visibility from that effective value. The mobile override must not rewrite the stored boolean, so returning to 48rem or wider restores the user's last chosen state, which is expanded by default. The sidebar remains on screen at every width, and there is no horizontal page scroll at the 20rem (320px) test width.
  - Collapsed nav links keep their accessible names and show their visible labels on hover and keyboard focus. Hide the visible text with a screen-reader-only technique rather than `display: none`, so the links never lose their names. Place the flyout label on the inline-end side with logical properties and render it outside the nav's scroll clip, such as in a portal or with fixed positioning, so it is never cut off; do not use a `title` attribute as the only mechanism because it does not appear on keyboard focus. Style the flyout as a `primary` pill with `canvas` 14px/500 text, an 8px radius, 0.5rem/0.75rem padding, `white-space: nowrap`, and a subtle elevation shadow; use the same flyout for the collapsed collapse control, and mark it `aria-hidden="true"` so the control's name is announced once.
  - Animate the sidebar grid column and the resulting content width with a 180–220ms ease-out transition, and give the collapse control the 150ms press-scale described below. Do not cross-fade both logos or animate the logo itself. The panel icon swaps instantly with the state. Under `prefers-reduced-motion: reduce`, switch widths instantly and remove the press scale.
  - Map the rail states to Ocean Depths tokens rather than raw hex values: `surface` rail, `border` divider, `text` base; unselected links use `text-muted` content with `surface-accent` background and `text` content on hover or focus; the current pill uses `primary` background with `canvas` content and `primary-hover` on hover; both brand tiles use `primary` with `primary-hover` on hover or focus; the focus ring uses `focus`. Validate every foreground/background pair against WCAG AA rather than assuming a token is readable.
  - Apply the `better-ui` interaction rules: put hover-only styles behind `@media (hover: hover)` so touch taps do not latch a hover state; transition only `background-color` and `color` at 150ms ease-out on nav links and the collapse control, never `transition: all`; give the collapse control a `:not(:disabled):active` scale of 0.96 over 150ms ease-out with `-webkit-tap-highlight-color: transparent`; set `overscroll-behavior: contain` on the independently scrolling nav; show a 2px `focus` outline at 2px offset through `:focus-visible` on every sidebar control; and remove the width transition and press scale under `prefers-reduced-motion: reduce`. Use the 1px `border` for structure and no elevation shadow on the rail.
  - Use 14px/500 nav labels, switching to 600 on the current pill. Use an 8px corner radius for nav items and the collapse control, a 12px radius for the brand tile, a 2.75rem minimum height for nav items, 0.5rem/0.75rem item padding, and an 8px icon-to-label gap. These follow the System Design 4px spacing scale and its 8px control / 12px card radius rules.
  - Add a “Skip to content” link as the first focusable element. It targets the workspace `<main id="workspace-content" tabIndex={-1}>`, which receives focus when activated. Keep a visible focus ring on every sidebar control and a logical focus order: skip link, brand, nav links, collapse control, page content.
  - Preserve the dashboard content below the shell header: the sample-data notice, five KPI cards, and trend chart remain unchanged in data and behavior. The dashboard page no longer renders `dashboard-page`, its header, or its own `AuthRoute` wrapper.
  - Revalidate PRD-002's viewport budget with the sidebar expanded at 1280×800: the page header, notice, and five KPI cards still end above the 50% line (400px), the five cards stay in one row, no card exceeds 240px tall, and the trend card remains fully visible without vertical page scroll. Because the fluid sidebar takes 18% of the viewport (capped at 15rem), tune the workspace padding and card grid against the content width rather than the viewport. Use a container query for the five/two/one card columns, and lower the Applications sent breakdown threshold to a 9rem content-box width (about an 11rem outer card) so cards at the 1280×800 fluid width stay two-column and within the height budget. Do not reintroduce a fixed pixel sidebar width, and do not drop to fewer columns.
  - Below a 60rem content-container width, the KPI cards wrap to two per row, and below 28rem they stack one per row; the trend chart stacks below them. Keep the PRD-002 chart labels, hidden data table, legend, and empty state readable at the 20rem test width with the collapsed rail.
  - Use `%`, `fr`, `rem`, and `clamp()` for layout widths. Reference viewport sizes such as 1280×800 and 320px are test conditions, not CSS values; do not encode fixed pixel sidebar, card, or breakdown widths.
  - Keep the sidebar out of the auth screens. Authentication, session markers, and route guarding behave exactly as they do after PRD-002; only the location of the guard changes for workspace routes.
  - Add `lib/navigation.spec.mts` using the existing `node:test` pattern and include it in the `test` script. Cover exact path matches, the dashboard label/title/description, the unknown-path fallback, unique hrefs, and required fields on every record.
  - Component-level DOM specs remain deferred because no DOM test runner is installed. Document this as the same explicit exception used by PRD-002, and cover the shell with keyboard, zoom, reduced-motion, and responsive checks instead.
  - Update `ARCHITECTURE.md` for the route group, shell components, and navigation helper, and record the change in `CHANGLOG.md`.
- **Acceptance criteria:**
  - `/dashboard` resolves through `app/(workspace)/dashboard/page.tsx` and renders inside the shared workspace shell with no duplicated `h1`, header, or authentication guard.
  - The root redirect, `/login`, `/signup`, and all session and route-guard behavior work exactly as before; no sidebar appears on the auth screens.
  - The shell header shows `Dashboard` as the page title and `Welcome to dashboard.` as its description. Every workspace navigation record supplies the single page title, and an unmatched workspace path falls back to `JobFlow`.
  - The sidebar is continuously visible while the page scrolls at all supported widths, stays at the inline-start edge of the two-column shell, uses the light `surface` background with a 1px `border` inline-end divider, and uses logical properties for RTL. No raw hex values appear in the sidebar components; `text-muted` on `surface`, `text` on `surface-accent`, `canvas` on `primary`, `canvas` on `primary-hover`, and the `focus` ring all meet the System Design contrast rules.
  - Expanded, the sidebar column resolves to `clamp(13rem, 18%, 15rem)` (about 230px at 1280px) and shows the expanded JobFlow wordmark inside an 11×6rem dark navy rounded tile. Collapsed, it resolves to `clamp(4.5rem, 5.6%, 5rem)` (about 72px at 1280px) and shows the 1254×1254 compact mark inside a 3.5rem square dark tile. The two marks never appear together, neither is distorted or cropped, and both tiles sit on the light rail without changing the rail's background.
  - The collapse control is keyboard operable, has a 44px-tall minimum target, updates `aria-expanded`, swaps the visible logo, and announces “Collapse sidebar” or “Expand sidebar” without relying on the icon alone. Expanded, it is a full-width row with the visible label; collapsed, it is a 2.75rem square icon-only button with a visible flyout label on hover and keyboard focus.
  - The shell tracks one collapsed boolean whose default is expanded. The state survives navigation between workspace routes and resets to expanded on reload. At 48rem and wider it starts expanded; below 48rem the collapsed rail is forced visually while the toggle is hidden, without overwriting the expanded default for when the viewport grows back.
  - The brand links to `/dashboard` with the accessible name “JobFlow dashboard”, uses `primary` at rest and `primary-hover` on hover or keyboard focus, and shows the 2px `focus` ring; the image inside is not announced twice and is never recolored or animated.
  - Collapsed navigation links and the collapse control keep accessible names and reveal visible labels on hover and focus. The current route exposes `aria-current="page"` and a `primary` pill with `canvas` icon and label, 600 label weight, and a `primary-hover` hover state; unselected items use `text-muted` icons and labels with a `surface-accent`/`text` hover or focus state and meet AA contrast. Selection never relies on color alone.
  - The Dashboard nav item renders the confirmed `layout-dashboard` Lucide icon, and the collapse control renders `panel-left-close` when expanded and `panel-left-open` when collapsed. All three render at 20px with a 2px absolute stroke, `currentColor`, and an 8px gap in a non-shrinking 20×20 box. All three are `aria-hidden`; the two panel icons mirror horizontally under `dir="rtl"` while `layout-dashboard` does not.
  - Hover-only styles are wrapped in `@media (hover: hover)`; nav and control background/color transitions run at 150ms and name only the changing properties; the collapse control has a 0.96 `:not(:disabled):active` press scale over 150ms with the tap highlight suppressed; the scrolling nav uses `overscroll-behavior: contain`; and every sidebar control shows a 2px `focus` ring at 2px offset through `:focus-visible`.
  - The skip link is the first focusable element, moves focus to `#workspace-content`, and every sidebar control has a visible focus ring and logical tab order.
  - Only existing routes appear in navigation; no dead, disabled, or “coming soon” links are rendered.
  - At 1280×800 with the sidebar expanded, the five KPI cards remain in one row, end above 400px, stay at or below 240px tall, and the trend chart is fully visible without vertical page scroll. The fluid sidebar is accounted for in the grid and does not introduce horizontal overflow.
  - The six-status breakdown switches to two columns at a 9rem card content-box width (about an 11rem outer card), so it stays two-column at the 1280×800 expanded-shell width instead of stacking and breaking the height budget.
  - At the 20rem (320px) test width with the collapsed rail, the dashboard stacks to one card per row, the chart and its hidden table remain available, and there is no horizontal page scroll.
  - Sidebar and content widths use `%`/`clamp()` with `rem` minimums; no fixed pixel sidebar width, fixed pixel card width, or fixed pixel breakdown threshold is introduced.
  - The sidebar width transition runs only between 180ms and 220ms, and the collapse control press scale runs at 150ms; both are removed under `prefers-reduced-motion: reduce`.
  - `lib/navigation.spec.mts` covers matches, fallback, unique hrefs, and required fields; `npm test`, `npm run lint`, and `npm run build` pass.
  - `ARCHITECTURE.md` and `CHANGLOG.md` describe the new workspace shell and navigation source.
- **Deliberate defaults:** The shell excludes login and signup; the sidebar tracks a single in-memory collapsed boolean that defaults to expanded and resets on reload; mobile uses the collapsed rail instead of an off-canvas drawer; only the dashboard appears in navigation until more pages exist.

- **Open questions:** None blocking. Deferred decisions: whether the collapsed state should later persist per user, whether a drawer or bottom navigation should replace the rail on phones, and which additional sections should join the navigation once those pages exist. Auth screens are intentionally out of scope.

### PRD-004 — Backend Foundation: Real Accounts and Application Persistence

- **Status:** Ready for Code
- **Problem and users:** JobFlow currently accepts any well-formed email and password, stores only a tab-scoped browser marker, and shows the same hardcoded sample applications to every user. Signed-in job seekers therefore have no real account, their session ends when the tab closes, and their application data neither exists on a server nor stays private. The project needs a server-side source of truth before the application tracker or any multi-user feature can be built.
- **Compatibility note:** This requirement replaces PRD-001's `sessionStorage` mock session with real server-side authentication and replaces PRD-002's shared sample records with per-user persisted records. PRD-002's six statuses, counting formulas, stale rule, response-rate formula, and chart behavior remain unchanged. PRD-003's shell gains a signed-in account area and sign-out control.
- **Database decision:** A cluster-based MongoDB Atlas deployment is the required database for this project. Use a standard Atlas replica-set cluster through its `mongodb+srv://` connection string in `ap-south-1`, deployed to be close to Vercel functions in `bom1`; do not substitute a local-only database, a non-cluster deployment, PostgreSQL, or SQLite.
- **Decisions locked in (from grilling):**
  - **Auth:** Better Auth with `@better-auth/mongo-adapter`. The adapter must reuse the single cached `MongoClient` per server process. Login failures return a generic `"Invalid email or password."`; duplicate signups (case-insensitive) return a field-specific error on the `email` field.
  - **Sessions:** Tab-scoped database sessions with HTTP-only cookies (no Max-Age/Expires; expire when browser/tab closes). Still use Better Auth database sessions for revocation on sign-out. Server-side validation via `auth.api.getSession` is mandatory.
  - **Migrations:** `migrate-mongo` for repository-tracked, idempotent index creation.
  - **Deployment:** Vercel (Asia Pacific). Production cookies require `Secure: true`, `SameSite: Lax`. 
  - **Email verification:** Required before account activation/sign-in.
  - **Demo data:** None - new accounts start empty with no demo records.
  - **Tracker UI:** Separate (PRD-006). Google sign-in remains disabled.
- **Requirements:**
  - Use a cluster-based MongoDB Atlas deployment as the system of record and the official `mongodb` Node.js driver as the single data-access client. Do not add Mongoose or a second ODM alongside the native driver. Use one shared, cached `MongoClient` per server process and reuse the same client for the auth adapter so the Atlas cluster's transaction support is available.
  - Use Better Auth with `@better-auth/mongo-adapter` for email/password handling and database sessions. Configure it to use the shared cached `MongoClient`. Support email verification flow as required.
  - Keep every database credential and authentication secret server-only. Add the required variable names to a committed `.env.example` with placeholder values, including `MONGODB_URI`, the optional `MONGODB_DB`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Document local setup in `README.md` and fail fast with a clear server error when a required variable is missing. Never commit real secrets or expose the connection string to client code.
  - Create the Atlas database user with read/write access limited to the JobFlow database, never an Atlas admin account. Use the TLS `mongodb+srv://` connection string, keep developer and production databases separate, and restrict network access with the Atlas IP access list for development. Production uses `0.0.0.0/0` for v1 with a dedicated user, strong secret, TLS, and Atlas alerts until static egress or PrivateLink is available. Production uses a paid Atlas cluster tier with automated backups and a documented restore check; a shared/free cluster is acceptable for development and demos only. Use `ap-south-1` close to Vercel `bom1`.
  - Store auth data in Better Auth-managed MongoDB collections (`users`, `sessions`, `accounts`, and `verification` if required) with those collection names configured explicitly. The `users` document holds the normalized lowercase email and the user's full name; the auth adapter stores the password hash in the credential account document. Track email verification status.
  - Store applications in an `applications` collection with `_id` (ObjectId), `userId` (ObjectId), `company`, `role`, `appliedAt` (BSON Date), `status` (string), `statusChangedAt` (BSON Date), `createdAt` (BSON Date), and `updatedAt` (BSON Date). The status accepts only `applied`, `screening`, `interview`, `offer`, `rejected`, and `withdrawn`. Serialize `_id`, `userId`, and dates at the server boundary so client code receives string IDs and ISO date strings, never raw BSON or driver-specific types.
  - Add a repository-tracked index and migration workflow using `migrate-mongo` that can initialize an empty database with one documented command and is safe to run repeatedly. Create at least: a unique index on `users.email`; a unique index on `sessions.token`; indexes on `sessions.userId` and `sessions.expiresAt`, with a TTL policy on the expiry field; and application indexes on `{ userId: 1, appliedAt: -1, _id: -1 }` and `{ userId: 1, status: 1 }`. Do not create application indexes only through ad-hoc Atlas UI edits.
  - Keep signup and login on the existing screens and retain the current field validation: valid email format, password of at least 8 characters, and matching confirmation on signup. Signup requires email verification before the account can be used to sign in/access protected routes. Duplicate emails are rejected case-insensitively with a field-specific error. Password reset and Google sign-in remain out of scope for this requirement; keep the Google button disabled.
  - Let the authentication library hash and verify passwords with its supported algorithm. Never store or log plaintext passwords. Login failures return one generic invalid-email-or-password message so the response does not reveal whether an account exists or whether email is unverified. Signup may return a field-specific duplicate-email error so the user can correct it.
  - Use database-backed browser-session cookies with HTTP-only cookies (`Secure: true` in production on Vercel, `SameSite: Lax`, `Path=/`, no Max-Age/Expires). Client JavaScript must not be able to read the session token. The cookie is shared by tabs and normally clears when the browser session ends; the server session expires after 30 days. Rotate or regenerate on sign-in, and delete their server session document on sign-out. Invalid or expired sessions are treated as signed out.
  - Replace the client-side `AuthRoute`/`sessionStorage` decision with a server-side session check using the auth library's server API (e.g., `auth.api.getSession({ headers: await headers() })`) in the workspace layout or page. A `proxy.ts` redirect may run first for speed, but authorization must not rely only on the presence of a session cookie. Signed-out requests to workspace routes redirect to `/login` before the shell renders; signed-in requests to `/login` or `/signup` redirect to `/dashboard`. Keep the root `/` redirect behavior unchanged. Remove the mock session key and its helpers after the cutover.
  - Add a visible signed-in account area with the user's name or email and a keyboard-operable "Sign out" control in the workspace header. Signing out deletes the server session, clears the cookie, and redirects to `/login`. On narrow screens the control may collapse to an icon-only button with an accessible name. Use `better-ui` and confirm any new Lucide icon with `suggest-lucide-icons` before implementation.
  - Provide authenticated application persistence endpoints or equivalent server actions for list, create, update, and delete. List returns only the current user's records, newest `appliedAt` first with `_id` as a stable tie-breaker. Create defaults `status` to `applied` and sets `statusChangedAt` to `appliedAt`; changing status sets `statusChangedAt` to the change time. Updating company or role must not change either timestamp. Reject an invalid ObjectId as `404`, not as an unhandled server error.
  - Validate every write at the server boundary: company and role are trimmed, non-empty, and at most 200 characters; `appliedAt` is a valid date and not in the future; `status` is one of the six allowed values. Return `401` for unauthenticated requests, `400` with field-safe messages for invalid input, and `404` when a record does not exist or belongs to another user. Never return another user's record or confirm its existence.
  - MongoDB has no row-level security, so enforce per-user isolation in one server-only repository layer. Derive `userId` from the validated session and never from a request body, query string, or header. Every read and mutation must include `userId` in its filter, for example `{ _id, userId }` for updates and deletes. Do not let route handlers or components query the `applications` collection directly. Automated tests must prove that changing an identifier cannot cross the user boundary.
  - Replace `getApplications()` sample data in the dashboard with a server-side read of the signed-in user's records. Remove the sample-data notice. Keep `summarizeApplications()` and `getWeeklyApplicationCounts()` unchanged so the KPI and chart formulas do not drift. The dashboard may become a Server Component with the existing chart as its client child. New accounts start with zero applications (no demo data) and see the existing empty state, with the chart empty message and no shared demo records.
  - Never cache authenticated or per-user responses in a shared cache. Configure the dashboard and API as dynamic where required by Next.js 16 Cache Components, and ensure a response for one user can never be served to another.
  - Rely on the auth library's origin and CSRF checks, configure its trusted origins explicitly (including localhost for dev and Vercel deployment URLs), and keep `SameSite=Lax` on the session cookie with `Secure` in production. Rate-limit login and signup attempts with Better Auth's in-memory limiter for v1, returning `429` with `Retry-After` when the limit is exceeded. Document that the limiter is per-instance and move to a shared store before horizontal scaling.
  - Return generic server errors without MongoDB error details, stack traces, or secrets. Log server-side failures with request context but never log passwords, session tokens, or full application payloads.
  - Add automated coverage for the new trust boundaries. Unit tests cover input validation, BSON-to-API mapping, and unchanged summary/trend helpers. Integration tests cover signup with email verification flow, duplicate email, login success and failure (including unverified email), session persistence (browser-session cookie behavior), sign-out, unauthenticated access, application create/list/update/delete, invalid ObjectId handling, date serialization, and two-user isolation. Run integration tests against a dedicated Atlas test database or isolated database, never against production data.
  - Document the Atlas cluster setup (Asia Pacific region), database user and network access, environment variables, index and migration commands using `migrate-mongo`, optional development seed command (not auto-run), and the new server/data boundaries in `ARCHITECTURE.md` and `README.md`. Record the cutover behavior: existing mock sessions are invalidated, and the hardcoded sample applications are not migrated because they were never user data.
  - Update the route guard tests and any existing specs that assume the mock session. Run `npm test`, `npm run lint`, and `npm run build` before marking the requirement complete.
  - Out of scope for this requirement: the application tracker UI for adding, editing, and changing status; password reset; OAuth sign-in; account deletion; admin roles; audit history; attachments; notifications; and analytics beyond the existing dashboard. The API and persistence may support the tracker, but no tracker screen is required here (separate PRD-006). Google sign-in button remains disabled.
- **Acceptance criteria:**
  - A fresh checkout with a documented Atlas connection string and one migration command creates the required indexes, and the app fails fast with a clear message when a required environment variable is absent.
  - The running app connects through `MONGODB_URI` to the configured cluster-based Atlas deployment; no local MongoDB process or alternative database is required.
  - Signup with a valid name, email, password, and matching confirmation creates a real MongoDB user and credential record, signs the user in, and opens `/dashboard`; the stored password is not plaintext, and the same email with different casing is rejected as a duplicate.
  - Login with correct credentials creates a database-backed, HTTP-only session cookie and opens `/dashboard`. Login with an unknown email or wrong password shows one generic error and does not reveal whether the email exists.
  - A valid session survives a page refresh in the same browser; closing one tab does not sign the user out, and closing the browser normally clears the session cookie (subject to browser session-restore behavior). After 30 days, or after sign-out, the session document is rejected or deleted and protected routes redirect to `/login`.
  - Signed-out workspace requests redirect to `/login` before the shell renders; signed-in requests to `/login` and `/signup` redirect to `/dashboard`. No `sessionStorage` mock marker is read or written, and the guard validates the session on the server rather than trusting cookie presence alone.
  - The workspace header shows the signed-in user's name or email and a keyboard-operable sign-out control; activating it clears the session and cookie and opens `/login`.
  - Two signed-in users can each create and list applications, and neither can read, update, or delete the other's records even when supplying the other record's identifier. Unauthorized cross-user access returns `404`, unauthenticated requests return `401`, and malformed ObjectIds do not crash the route.
  - Application writes reject empty or overlong company/role values, invalid or future `appliedAt` dates, and unknown statuses with `400`; valid writes persist and return the stored record with string IDs and ISO date strings.
  - Creating an application defaults its status to `applied` and sets `statusChangedAt` to `appliedAt`; changing status updates `statusChangedAt` to the change time, while editing company or role leaves both dates unchanged.
  - The dashboard reads the signed-in user's persisted records only, shows no sample-data notice, and displays the existing KPI cards, response rate, stale flag, and 12-week chart from those records. A new account shows all zero values, a "—" rate, and the empty chart and application messages.
  - The same data set produces the same summary counts and weekly buckets as before; the existing summary and trend helper tests still pass.
  - The unique email, session token, session TTL, session user, and application indexes exist after migration. The `MongoClient` is cached per process, and no new client is opened per request.
  - Authenticated responses are not served from a shared cache, the session token is unreadable from client JavaScript, and no MongoDB connection string, Atlas credential, or auth secret appears in the client bundle or repository.
  - Cross-origin mutations without a valid trusted origin are rejected, and repeated failed login or signup attempts return `429` with `Retry-After`.
  - `npm test`, `npm run lint`, and `npm run build` pass, including new validation, mapping, and Atlas integration coverage.
  - `ARCHITECTURE.md`, `README.md`, `CHANGLOG.md`, and any affected specs describe the Atlas schema, indexes, server-only repository, session boundary, and migration workflow; `SYSTEM_DESIGN.md` is updated if the account area establishes a new shared UI pattern.
- **Deliberate defaults:** A cluster-based MongoDB Atlas deployment (`ap-south-1` with Vercel `bom1`) and the native MongoDB driver are mandatory. Better Auth with `@better-auth/mongo-adapter` and a shared cached MongoClient. Browser-session HTTP-only database sessions with a 30-day server expiry (shared by tabs; normally cleared when the browser closes). Email verification required before sign-in. New accounts start empty (no demo data). Migrations via `migrate-mongo`. Deployed on Vercel with Secure/Lax cookies in production. Tracker UI is separate (PRD-006). Google sign-in remains disabled.
- **Open questions:** None blocking auth implementation. Database details are locked in PRD-005. The only remaining deployment question is the exact production trusted origins for `BETTER_AUTH_URL` and Vercel preview URLs.

### PRD-005 — Database Setup, Collections, and Schema

- **Status:** Ready for Code
- **Relationship to PRD-004:** PRD-004 mandates MongoDB Atlas and defines authentication and API behavior. This requirement is the database companion: it fixes the environment layout, the collection count, the field-level schema, the index set, and the operating decisions so implementation has one reference. It adds no product behavior beyond PRD-004. Where a database detail conflicts, this document wins. The tracker UI previously referenced as PRD-005 is renumbered PRD-006.
- **Implementation ownership:** This requirement adds no separate code tasks. PRD-004.1 and PRD-004.2 own the database foundation and migrations; extend those tasks with the two missing indexes, the explicit collection names, and the future-date rejection.
- **Decisions locked in (from grilling):**
  - **Session:** HTTP-only browser-session cookie with no Max-Age, shared by tabs and normally cleared when the browser closes; 30-day server-side expiry. True per-tab isolation and a persistent “remember me” cookie are rejected for v1.
  - **Email and verification:** Resend sends verification emails. A token is valid for 1 hour, and an unverified account cannot sign in or reach the workspace.
  - **Account deletion:** Deferred for v1. There is no deletion UI, cascade, or retention job; a public launch must add a deletion and retention policy first.
  - **Region and tier:** Atlas `ap-south-1` with Vercel `bom1`; production uses M10 or higher.
  - **Network and backups:** Production uses `0.0.0.0/0` on the Atlas access list with a dedicated production user, strong secret, TLS, and alerts. Cloud Backup keeps 7 days of daily snapshots. Revisit static egress or PrivateLink when it is available.
  - **Schema scope:** Five domain collections. `applications` stays minimal; `url`, `notes`, `salary`, `location`, and contact fields arrive with the tracker PRD. No status-history collection; the current-status trend is accepted.
  - **Rate limiting:** Better Auth's in-memory limiter for v1. The per-instance limitation is documented, and no shared rate-limit collection is added.
  - **Naming and access:** Environment-suffixed databases; one `readWrite` user per cluster boundary for both the app and `migrate-mongo`; no Atlas admin account.
  - **Dates:** A future `appliedAt` is rejected with `400`, never clamped.
- **Problem and users:** JobFlow needs real accounts and per-user applications, but the current schema exists only as scattered TypeScript types, an index migration, and prose in PRD-004. Without one database contract, collection names can drift from Better Auth's expectations, indexes get created by hand in the Atlas UI, dates and IDs leak BSON types to the browser, and a missing `userId` filter can expose another user's applications. Developers, migrations, tests, and future features all need the same answer for what is stored and why.
- **Scope:** Atlas environment layout, collection inventory, field-level schema, relationships, indexes, validation boundaries, serialization, migration rules, retention, backups, and the decisions behind them.
- **Out of scope:** Auth UI and API implementation (PRD-004), tracker UI (PRD-006), password reset, OAuth sign-in, account deletion, admin roles, attachments, notifications, analytics, status history, sharding, and a shared rate-limit store.

**Direct answers**

- **Database engine:** One engine only — MongoDB Atlas on a standard replica set. No SQL database, ORM, or second datastore is added in v1.
- **Databases required:** Three core logical databases — `jobflow_dev`, `jobflow_test`, and `jobflow_prod` — plus `jobflow_preview` when Vercel preview deployments are enabled. Development, test, and preview share a free M0 cluster; production uses a separate M10-or-higher cluster. Atlas system databases (`admin`, `local`, `config`) are not application databases.
- **Tables required:** MongoDB has collections, not tables. v1 needs **five domain collections**: `users`, `accounts`, `sessions`, `verification`, and `applications`. `migrate-mongo` adds one internal **`changelog`** collection, for **six collections total** in each database after migration.
- **Schema style:** Document schema with explicit field names and types, reference-based relations through `userId`, and validation at the TypeScript, Zod, repository, and unique-index layers. No embedded application arrays, no SQL foreign keys, and no `$jsonSchema` collection validators in v1.

#### Environment layout

| Environment | Atlas cluster | Database | Used by | Reset policy |
| --- | --- | --- | --- | --- |
| Development | `jobflow-dev` (M0 shared) | `jobflow_dev` | Local `npm run dev` | May be dropped and recreated |
| Test | `jobflow-dev` (M0 shared) | `jobflow_test` | Automated integration tests | Dropped or recreated per run |
| Preview | `jobflow-dev` (M0 shared) | `jobflow_preview` | Vercel preview deployments | Reset on demand; never holds production data |
| Production | `jobflow-prod` (M10+ dedicated) | `jobflow_prod` | Vercel production | Never reset; restore from backup only |

- Co-locate the database with the functions: default `ap-south-1` (Mumbai) with Vercel region `bom1`. If the target audience is elsewhere, move both together before production rather than running Atlas on another continent.
- `MONGODB_DB` must be set explicitly in every deployed environment. Do not rely on the local `jobflow` fallback in production.
- Preview deployments use `jobflow_preview` and never receive production credentials. The preview database is reset on demand and never holds production data.
- Atlas projects separate development from production; production alerts, backups, and billing are configured on the production project only.

#### Collection inventory

| # | Collection | Owner | Purpose | Expected volume |
| --- | --- | --- | --- | --- |
| 1 | `users` | Better Auth | One document per account: identity, normalized email, verification state | One per user |
| 2 | `accounts` | Better Auth | Provider records, including the credential password hash | One per provider per user |
| 3 | `sessions` | Better Auth | Server-side sessions for revocation and expiry | Bounded by session TTL |
| 4 | `verification` | Better Auth | Email-verification tokens and future reset tokens | Bounded by token TTL |
| 5 | `applications` | JobFlow app | One document per job application | Up to hundreds per user |
| — | `changelog` | `migrate-mongo` | Applied-migration bookkeeping | One per migration |

Collections deliberately **not** created in v1: `jobs`, `companies`, `interviews`, `contacts`, `attachments`, `notifications`, `applicationEvents`, `rateLimits`, and `auditLogs`. Company and role stay as strings on `applications`; adding normalized company or job entities is a tracker/product decision, not a database prerequisite.

#### Relationships

```text
users 1 ──── N accounts        (userId)
users 1 ──── N sessions        (userId)
users 1 ──── N applications    (userId)
verification                   (standalone; keyed by identifier, not userId)
```

- Relations are references, never embedded documents or arrays. A user's applications are not stored inside the user document because that array is unbounded, would approach MongoDB's 16 MB document limit, and defeats per-user index ordering.
- MongoDB has no foreign keys and no row-level security. The server-only repository enforces ownership; every query and mutation includes `userId` from the validated session, never from a request body, query string, or header.
- Cascade deletes are out of scope because account deletion is out of scope. If account deletion is added later, delete in the order `applications` → `sessions` → `accounts` → `users` with an idempotent cleanup, not a best-effort loop.

#### Schema

Common rules: `_id` is a BSON `ObjectId` unless noted; all dates are BSON `Date` values in UTC; field names are camelCase; strings are trimmed at the write boundary; `createdAt` and `updatedAt` are server-generated; optional fields are omitted or `null`, never empty strings; and the app never writes Better Auth collections directly.

**`users`** — one document per account. Better Auth owns writes.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Primary key |
| `name` | string | Yes | Trimmed, 1–200 characters |
| `email` | string | Yes | Trimmed, lowercase, valid email, unique |
| `emailVerified` | boolean | Yes | Defaults to `false`; becomes `true` only after verification |
| `image` | string or null | No | Better Auth avatar field; unused in v1 |
| `createdAt` | Date | Yes | UTC |
| `updatedAt` | Date | Yes | UTC |

**`accounts`** — one document per provider identity. Better Auth owns writes.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Primary key |
| `userId` | ObjectId | Yes | References `users._id`; indexed |
| `accountId` | string | Yes | Credential provider uses the user's ID; OAuth uses the provider's ID |
| `providerId` | string | Yes | `credential` in v1; `google` reserved for later |
| `password` | string | No | Auth-library hash only; never logged, returned, or selected by client code |
| `accessToken` | string or null | No | Reserved for OAuth |
| `refreshToken` | string or null | No | Reserved for OAuth |
| `idToken` | string or null | No | Reserved for OAuth |
| `accessTokenExpiresAt` | Date or null | No | Reserved for OAuth |
| `refreshTokenExpiresAt` | Date or null | No | Reserved for OAuth |
| `scope` | string or null | No | Reserved for OAuth |
| `createdAt` | Date | Yes | UTC |
| `updatedAt` | Date | Yes | UTC |

**`sessions`** — server-side session records. Better Auth owns writes.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Primary key |
| `token` | string | Yes | Unique, secret; never logged or exposed to client JavaScript |
| `userId` | ObjectId | Yes | References `users._id`; indexed |
| `expiresAt` | Date | Yes | 30 days from creation; TTL deletes at expiry |
| `ipAddress` | string or null | No | Optional audit context; not displayed in UI |
| `userAgent` | string or null | No | Optional audit context; not displayed in UI |
| `createdAt` | Date | Yes | UTC |
| `updatedAt` | Date | Yes | UTC |

**`verification`** — one-time verification and future reset tokens. Better Auth owns writes. Despite the singular name, it holds many documents.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Primary key |
| `identifier` | string | Yes | Email or purpose-scoped identifier; indexed; treated as opaque |
| `value` | string | Yes | One-time secret; never logged or returned |
| `expiresAt` | Date | Yes | One hour for email verification; TTL deletes at expiry |
| `createdAt` | Date | Yes | UTC |
| `updatedAt` | Date | Yes | UTC |

**`applications`** — one document per application. The only product-data collection in v1.

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `_id` | ObjectId | Yes | Primary key; serialized as a string |
| `userId` | ObjectId | Yes | References `users._id`; derived from the session only |
| `company` | string | Yes | Trimmed, 1–200 characters |
| `role` | string | Yes | Trimmed, 1–200 characters |
| `appliedAt` | Date | Yes | UTC; must not be in the future at write time |
| `status` | string | Yes | One of `applied`, `screening`, `interview`, `offer`, `rejected`, `withdrawn`; defaults to `applied` |
| `statusChangedAt` | Date | Yes | Equals `appliedAt` on create; set to the change time only when `status` changes |
| `createdAt` | Date | Yes | Server time at insert |
| `updatedAt` | Date | Yes | Server time at every update |

- Editing `company`, `role`, or `appliedAt` must not change `statusChangedAt`. Only a status transition changes it.
- A future `appliedAt` is rejected at the validation boundary with `400`; do not silently clamp it to `now` in the repository. Clamping hides client bugs and makes the stored date disagree with what the user submitted.
- The six statuses remain string values, not numeric codes, so raw documents stay readable and indexes stay stable when the UI changes.
- No `notes`, `url`, `salary`, `location`, or contact fields in v1. The tracker PRD decides which of those become real columns; adding them later is an additive schema change.

Stored document shape (Mongo shell notation; the API boundary serializes `_id`/`userId` to strings and dates to ISO):

```js
{
  _id: ObjectId("66f0c1b2e4b0a1c2d3e4f501"),
  userId: ObjectId("66f0c1b2e4b0a1c2d3e4f500"),
  company: "Northwind Labs",
  role: "Frontend Engineer",
  appliedAt: ISODate("2026-10-01T00:00:00.000Z"),
  status: "interview",
  statusChangedAt: ISODate("2026-10-08T09:30:00.000Z"),
  createdAt: ISODate("2026-10-01T12:00:00.000Z"),
  updatedAt: ISODate("2026-10-08T09:30:00.000Z")
}
```

#### Index inventory

| Collection | Index key | Name | Options | Serves |
| --- | --- | --- | --- | --- |
| `users` | `{ email: 1 }` | `users_email_unique` | Unique | Duplicate-email rejection, login lookup |
| `sessions` | `{ token: 1 }` | `sessions_token_unique` | Unique | Session lookup by cookie token |
| `sessions` | `{ userId: 1 }` | `sessions_userId` | — | Sign out all sessions, user cleanup |
| `sessions` | `{ expiresAt: 1 }` | `sessions_expiresAt_ttl` | TTL, `expireAfterSeconds: 0` | Expired-session cleanup |
| `accounts` | `{ userId: 1 }` | `accounts_userId` | — | Accounts for a user |
| `accounts` | `{ providerId: 1, accountId: 1 }` | `accounts_provider_account_unique` | Unique | One identity per provider/account pair |
| `verification` | `{ identifier: 1 }` | `verification_identifier` | — | Token lookup by email or identifier |
| `verification` | `{ expiresAt: 1 }` | `verification_expiresAt_ttl` | TTL, `expireAfterSeconds: 0` | Expired-token cleanup |
| `applications` | `{ userId: 1, appliedAt: -1, _id: -1 }` | `applications_user_applied_desc` | — | List one user's applications, newest first |
| `applications` | `{ userId: 1, status: 1 }` | `applications_user_status` | — | Status filters and count grouping |
| `changelog` | `migrate-mongo` default | — | — | Migration bookkeeping; not queried by the app |

- The `applications` compound index starts with `userId`, so a separate `{ userId: 1 }` index is redundant. Keep only the two listed application indexes.
- TTL deletion is asynchronous and can lag by about a minute. Code must still reject an expired session or token by comparing `expiresAt` with the current time; TTL is cleanup, not the security check.
- Add the two new index requirements — `accounts_provider_account_unique` and `verification_expiresAt_ttl` — in a follow-up migration. Never edit a migration that may already be applied.
- The application list query must use `applications_user_applied_desc` with no blocking in-memory sort; verify with `explain("executionStats")` and reject a `COLLSCAN` during review.

#### Schema enforcement

1. **TypeScript types** in `lib/db/types.ts` describe the stored shape for server code.
2. **Zod schemas** at the API boundary validate untrusted input: trimmed company/role of 1–200 characters, a valid non-future `appliedAt`, and the six-value status enum.
3. **The server-only repository** is the only application code allowed to touch `applications`. It derives `userId` from the session and includes it in every filter.
4. **Unique indexes** enforce email and provider-identity uniqueness at the database level, closing the race between a pre-check and an insert.
5. **Serialization** at the server boundary converts `_id` and `userId` to strings and `Date` values to ISO 8601 strings. Password hashes, session tokens, and verification values never cross that boundary.

- No `$jsonSchema` collection validators in v1. Validation would otherwise live in Zod, TypeScript, and a Mongo validator that must be migrated in lockstep, and `collMod` would require a broader database role. Revisit this only if direct database edits become a real risk; if adopted, add validators through a migration and use a migration-only role.
- Better Auth owns `users`, `accounts`, `sessions`, and `verification`. Application code reads them only through the auth library; debug scripts that read them directly must never be imported into request paths.
- Do not add custom fields to auth collections in v1. Profile or preference data gets its own collection when a feature needs it.
- Map duplicate-key error `11000` on `users_email_unique` to a field-specific duplicate-email error, not a generic server error. Map invalid ObjectIds and other-user records to `404`.

#### Important decisions

| Decision | Choice | Why and trade-off |
| --- | --- | --- |
| Database engine | MongoDB Atlas, native `mongodb` driver | Already mandated by PRD-004; document shape tolerates tracker fields without migrations. PostgreSQL, SQLite, and Mongoose were rejected because they conflict with that mandate or add a second data layer. Trade-off: no joins or foreign keys, so ownership and integrity live in the repository. |
| Topology | Three-node replica set, no sharding | Gives high availability and transactions at low cost. A few million application documents are still within M10 storage; revisit before the working set outgrows RAM, and shard only after measured pressure. |
| Environments | Separate logical databases; separate production cluster | Prevents test data and test migrations from reaching real users. Trade-off: production costs and config are managed twice. |
| Region and tier | `ap-south-1` + Vercel `bom1`; M0 dev, M10+ prod | Keeps database round trips close to functions and provides backups in production. Revisit if the audience or Vercel plan changes. |
| Collection names | Exact five names, plus `changelog` | Predictable code and migrations. Do not let the adapter create singular `user`/`session`/`account` duplicates. |
| Auth model naming | Explicit per-model names; no blanket `usePlural` | `verification` is intentionally singular while the others are plural; a global plural flag would create the wrong set. |
| Auth ownership | Better Auth owns four collections; app owns `applications` | Library upgrades and password/token rules stay in one place. The app must not hand-write hashes or session tokens. |
| Identifiers | ObjectId `_id`; ObjectId `userId` references | Native, compact, indexed, and stable under rename. Serialize to strings only at the API boundary. |
| Dates | BSON `Date` in UTC; ISO strings at the boundary | Correct sorting, TTL, and stale-day math. Trade-off: date-only input becomes a UTC timestamp and must be displayed consistently. |
| Email identity | Trim and lowercase before every auth call; unique index; no collation | Case variants cannot create duplicate accounts, and Better Auth lookups stay exact. Trade-off: any future OAuth path must normalize too. |
| Email verification | Resend; 1-hour token; unverified accounts cannot sign in | Confirms ownership before access and keeps the token short-lived. Requires a verified sending domain and a production API key. |
| Sessions | Database-backed, browser-session cookie (no Max-Age), 30-day `expiresAt`, TTL | Revocable on sign-out and expires server-side. A cookie is shared by every tab and cleared when the browser session ends; it is not truly tab-scoped. True per-tab isolation would require a token in `sessionStorage` and lose HTTP-only protection. This replaces PRD-004's earlier tab-scoped wording. |
| Status storage | String enum validated in Zod | Readable documents and stable indexes. Trade-off: the enum is enforced by code and must be updated in one shared schema. |
| Per-user isolation | `userId` in every read and write; no RLS | MongoDB has no row-level security, so the repository is the security boundary. Integration tests must prove cross-user IDs return `404`. |
| Derived data | No counters, summary documents, or status-history collection | Counts and trends are computed from applications, so they cannot drift. Trade-off: the 12-week trend reflects current status, not historical transitions. |
| Tracker fields | Minimal `applications` in v1; `url`, `notes`, `salary`, `location`, and contacts arrive with PRD-006 | Keeps this PRD focused on the foundation. The tracker PRD owns the UI, validation, and additive migration for those fields. |
| Deletes | Hard delete applications; no `deletedAt` | Simple and matches the current API. Trade-off: deletion is recoverable only from backups; the tracker UI needs confirmation before deleting. |
| Account deletion | Deferred past v1; no deletion UI, cascade, or retention job | Avoids a half-built privacy flow. Trade-off: a public launch is blocked until a deletion and retention policy is designed and implemented. |
| Concurrent edits | Last write wins; no version field | Appropriate for a single-owner application list. Revisit with optimistic concurrency if shared or multi-device editing causes lost updates. |
| Migrations | `migrate-mongo`, immutable after apply, idempotent, index-only rollback | Repeatable setup and safe reruns. `down` drops indexes but never collections or user data. |
| Seeding | No demo data in any environment by default; optional dev-only seed, never auto-run | Real accounts start empty and the empty state stays testable. Trade-off: manual demo setup when showcasing the app. |
| Connection pooling | One cached `MongoClient` per process; `maxPoolSize=10`, `serverSelectionTimeoutMS=5000` | Prevents serverless instances from exhausting Atlas connections. Trade-off: raise the pool only after measuring connection pressure. |
| Rate limiting | Better Auth in-memory limiter for v1 | No extra datastore or collection. Trade-off: limits are per serverless instance, so horizontal scaling weakens them; move to a shared store if that becomes a problem. |
| Database user | One development user for the three non-production databases and one production user for `jobflow_prod`; both `readWrite` only and shared by the app and `migrate-mongo`; never an Atlas admin | Least privilege for app and migrations. `readWrite` can create indexes; if DB validators are added later, introduce a separate migration role. |
| Network access | `0.0.0.0/0` on the Atlas access list for v1, with a dedicated production user, strong secret, TLS, and Atlas alerts | Works on Vercel plans without static egress and keeps setup simple. Trade-off: the database is reachable from any IP, so authentication and monitoring carry the protection; migrate to static egress or PrivateLink when available. |
| Backups | Cloud Backup on production, daily snapshots, at least 7-day retention, one restore drill before launch | Protects against accidental deletes and bad migrations. Development and test rely on re-seeding, not backups. |
| Read/write concerns | Primary reads, majority writes | Dashboard and session checks see the latest committed state. Secondary reads are not worth the staleness for this workload. |

#### Setup and migration workflow

1. Create the development Atlas project and `jobflow-dev` cluster in `ap-south-1`; create `jobflow-prod` separately when production is ready.
2. Create one database user per cluster boundary: a development user with `readWrite` on `jobflow_dev`, `jobflow_test`, and `jobflow_preview`, and a production user with `readWrite` on `jobflow_prod` only. Never use an Atlas admin account in the app or in migrations.
3. Add the developer IP to the development cluster's Atlas access list. Production uses `0.0.0.0/0` for v1 with a dedicated user, strong secret, TLS, and Atlas alerts; revisit static egress or PrivateLink when available.
4. Set `MONGODB_URI`, `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in `.env.local` for development and in the matching Vercel environment for deployments. Keep credentials out of the URI so special characters in the password are safe.
5. Run `npm run db:check` to confirm TLS connectivity and authentication.
6. Run `npm run migrate:up` to create the indexes and, implicitly, the five collections. Run `npm run migrate:status` to confirm the migration is applied.
7. Verify `db.getCollectionNames()` returns exactly `accounts`, `applications`, `changelog`, `sessions`, `users`, and `verification`, then inspect `getIndexes()` for each collection.
8. Complete one signup and one login, then confirm the `users`, `accounts`, and `sessions` documents and the session cookie attributes.
9. Create one application and confirm its defaults, then edit it and confirm `statusChangedAt` behavior.
10. Run `npm test`, `npm run lint`, and `npm run build`.

Migration rules:

- The existing `20251026000000-init-indexes.js` is the baseline. Add new timestamped migrations for the missing account and verification indexes; do not rewrite an applied migration.
- Each migration has one purpose, is safe to run twice, and includes a `down` that reverses only what it created.
- No migration inserts demo users or applications. Seed data, if needed, is a separate optional script.
- Never drop a collection or field in `up` without an explicit data-retention decision in this PRD.
- Production migrations run as a deliberate deploy step, not automatically from `next build` or a request.

#### Edge cases

- **Duplicate email:** two signups racing past the pre-check hit `users_email_unique`; the route returns a field-specific error on `email`.
- **Case variants:** `User@Example.com` is normalized to `user@example.com` before signup and login, so the second attempt is rejected as a duplicate.
- **Invalid ObjectId:** return `404`, never a driver exception or stack trace.
- **Other user's record:** return `404` for read, update, and delete; never confirm that the record exists.
- **Expired session or token:** reject by comparing `expiresAt` with the current time even if the TTL monitor has not deleted the document yet.
- **Future `appliedAt`:** reject with `400`; do not clamp silently.
- **Status changed twice in one update:** the last accepted status wins; `statusChangedAt` records that write.
- **Multiple tabs:** every tab shares one browser-session cookie and one session document; signing out in one tab invalidates the others. This is browser-session scope, not per-tab scope.
- **Company or role edit:** leaves `appliedAt`, `status`, and `statusChangedAt` unchanged.
- **Orphaned documents:** manual user deletion can leave applications or sessions behind; there is no cascade in v1. Use a documented cleanup script if it happens.
- **16 MB document limit:** not reachable because applications are separate documents and auth documents stay small; do not embed attachments.
- **Special characters in the database password:** passed as driver options, not parsed from the URI; do not URL-encode them into `MONGODB_URI`.
- **Partial signup:** rely on Better Auth's own flow; do not add a custom multi-collection transaction to the repository layer in v1.

#### Acceptance criteria

- Four logical databases exist: `jobflow_dev`, `jobflow_test`, `jobflow_preview`, and `jobflow_prod`; production is on a separate Atlas cluster, and preview deployments use `jobflow_preview`, never production.
- A fresh database plus `npm run migrate:up` creates exactly six collections — `users`, `accounts`, `sessions`, `verification`, `applications`, and `changelog` — and rerunning the command is a no-op.
- No singular `user`, `session`, or `account` collection exists after signup; Better Auth model names match the four configured auth model names exactly.
- `users.email` is unique; sessions have a unique `token` index, a `userId` index, and an `expiresAt` TTL index; accounts have `userId` and unique `{ providerId, accountId }`; verification has `identifier` and `expiresAt` TTL; applications have the two compound indexes listed above.
- The application list query uses `applications_user_applied_desc` with no `COLLSCAN` and no blocking in-memory sort.
- A first signup writes one `users` document and one credential `accounts` document; the password is hashed, the email is lowercase, and no plaintext password or token is returned.
- An unverified account cannot sign in or reach the workspace; a verification token older than 1 hour is rejected even before the TTL monitor removes it.
- A second signup with the same email in different casing is rejected with a field-specific error.
- Login creates a `sessions` document and an HTTP-only, browser-session cookie with no Max-Age or Expires attribute; a refresh in the same browser keeps the session, closing one tab does not sign the user out, closing the browser normally clears the cookie (subject to browser session-restore behavior), and sign-out deletes the session document and clears the cookie.
- An expired session or verification token is rejected before the TTL monitor removes it; TTL indexes exist and are not the only expiry check.
- Creating an application defaults `status` to `applied`, sets `statusChangedAt` equal to `appliedAt`, and fills `createdAt`/`updatedAt`; changing status updates `statusChangedAt`; editing company, role, or `appliedAt` does not.
- A future `appliedAt`, an unknown status, an empty company, and a company over 200 characters are rejected with `400`; a future date is not silently clamped.
- Two users cannot read, update, or delete each other's applications; invalid ObjectIds and cross-user identifiers return `404`; unauthenticated requests return `401`.
- Responses contain string IDs and ISO date strings, never raw `ObjectId`, BSON `Date`, password hashes, session tokens, or verification values.
- Production uses a database-scoped `readWrite` user, TLS via `mongodb+srv://`, the documented `0.0.0.0/0` access-list decision with Atlas alerts, Cloud Backup, and a tested restore; no Atlas admin or production credential appears in the repository or client bundle.
- `npm test`, `npm run lint`, and `npm run build` pass, and the database, indexes, and migration workflow are documented in `README.md`, `ARCHITECTURE.md`, and `CHANGLOG.md`.

#### Deliberate defaults

One MongoDB Atlas deployment family, one database per environment, five domain collections, a single `applications` collection for product data, reference-based ownership through `userId`, ObjectId identifiers, UTC BSON dates, string statuses, `migrate-mongo` for indexes, no demo data, no database validators, no counters or history collection, and a 30-day server session carried by a browser-session cookie. These are intentionally boring choices that keep the v1 surface small; each has a named upgrade path above.

#### Deferred decisions

None blocking implementation. These are intentionally deferred and have a named trigger:

- **Account deletion and retention:** Add a deletion policy, cascade or anonymization, and purge job before a public launch. V1 has no account-deletion UI.
- **Static egress or PrivateLink:** Move production off `0.0.0.0/0` when Vercel static egress or Atlas PrivateLink is available. This is a deployment change, not a schema change.
- **Status history:** Add an `applicationEvents` collection only if accurate historical trends or an audit trail become required. The current-status trend is accepted for v1.
- **Shared rate limiting:** Replace the in-memory limiter with a shared store only when traffic or horizontal scaling makes per-instance limits insufficient.
- **Tracker fields:** Add `url`, `notes`, `salary`, `location`, and contact fields with PRD-006 (tracker UI), using additive migrations.
- **Trusted origins:** Confirm the production `BETTER_AUTH_URL` and trusted origins in PRD-004. This is a deployment configuration detail, not a schema question.
- **Production tier review:** Re-evaluate M10 if connection pressure, storage, or backup needs exceed the launch assumption.
