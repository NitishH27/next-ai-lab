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
