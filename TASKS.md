# App Tasks

Use this file as the implementation backlog for requirements in `PRD.md`. Codex should review it when asked to find or implement pending app tasks. Add each task under **To Do** with a clear, actionable title, its PRD ID, and a short description of the expected result. Move tasks between sections as their status changes.

## To Do

<!-- Add new implementation tasks here, including tasks under active grilling. -->

## Ready for Code

<!-- Move tasks here when their grilling resolves; they are specified but not yet being implemented. -->

## In Progress

<!-- Move tasks here when implementation starts; they stay here until code and checks are done. -->

- **PRD-002.1 — Add applications model and summary helper:** Create `lib/applications.ts` with the six-status model, typed application records, relative-date sample data, `getApplications()`, and `summarizeApplications()`. Include `lib/applications.spec.mts` and wire it into `npm test`.
- **PRD-002.2 — Build the dashboard summary widgets:** Add `lucide-react` and the five compact KPI cards with label, count, leading Lucide icon (`send`, `message-circle-check`, `award`, `circle-x`, `clock`) at 20px with 2px absolute stroke, supporting line, resolved response rate, stale follow-up flag, tabular numerals, and the Applications sent six-status breakdown in a two-column list, using the existing card pattern and Ocean Depths tokens. Keep the heading and cards inside the top 50% of a 1280×800 viewport.
- **PRD-002.3 — Add sample-data and empty states:** Show the hardcoded-data notice above the widgets, and the zero-state message when the dataset is empty, with no dead links or buttons.
- **PRD-002.4 — Validate dashboard widgets:** Check the 1280×800 top-half fit and 240px card budget, single-row layout at 1024px+, 320px/tablet wrapping, the sent card breakdown, icon placement/stroke/alignment against `better-ui`, icon `aria-hidden` behavior, keyboard and screen-reader output, contrast and 200% zoom, then run `npm test`, `npm run lint`, and `npm run build`.

## Done

- **PRD-001.1 — Decide authentication and signup requirements:** Resolved email login, mock auth, signup fields/validation, tab-scoped session behavior, route guards, responsive panel placement, and custom Lottie concepts. PRD-001 is ready for implementation.
- **PRD-001.2 — Build the login screen:** Completed the responsive split layout, email/password validation and visibility toggle, signup link, disabled Google button, and signed-out `/` redirect.
- **PRD-001.3 — Build the signup screen:** Completed the signup route with full name, email, password, confirmation, validation, login navigation, and dashboard entry.
- **PRD-001.4 — Create and integrate auth Lottie animations:** Added custom local login/workspace and signup/career-progress Lottie assets, with static reduced-motion fallbacks.
- **PRD-001.5 — Implement mock session and dashboard routing:** Added valid-format mock login, tab-scoped session marker, route guards, and the initial dashboard welcome state. Passwords are never stored.
