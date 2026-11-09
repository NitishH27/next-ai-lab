# Application Architecture

## Current Structure

```text
next-ai-lab/
├── app/                 # App Router routes, layouts, and global styles
│   ├── (workspace)/     # URL-transparent signed-in route group
│   │   ├── layout.tsx   # Shared server session guard and top-nav shell
│   │   ├── dashboard/page.tsx # Dashboard route
│   │   └── profile/     # Profile page, loading/error states, and Server Action
│   ├── page.tsx         # Routes / to login or dashboard
│   ├── login/page.tsx   # Login route
│   ├── signup/page.tsx  # Signup route
│   ├── layout.tsx       # Root HTML shell and shared layout
│   ├── globals.css      # Global styles
│   └── favicon.ico      # Application icon
├── components/
│   ├── auth/            # Reusable auth layouts, controls, and forms
│   ├── dashboard/       # Dashboard summary strip and trend chart
│   ├── layout/          # Signed-in workspace shell and sticky top navigation
│   └── profile/         # Profile summary card, personal-details form, and component CSS
├── lib/                 # Shared auth, application, database, navigation, profile, summary, and trend helpers
│   ├── db/              # Cached MongoClient, database accessors, stored document types
│   ├── integration/     # Atlas-backed integration tests for the dedicated jobflow_test database
│   ├── repositories/    # Server-only, owner-scoped collection access
│   └── validators/      # Server-side input guards shared by repositories and routes
├── migrations/          # migrate-mongo index migrations; never edit an applied migration
├── scripts/             # Operational checks such as the Atlas connectivity check
├── public/              # Static assets served from the site root
├── AGENTS.md            # Contributor guide
├── RULES.md             # Development rules
├── SYSTEM_DESIGN.md     # Shared UI and visual design standards
├── ARCHITECTURE.md      # This architecture guide
├── CHANGLOG.md          # Codex change log
├── package.json         # Scripts and dependencies
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration and @/* alias
└── eslint.config.mjs    # ESLint configuration
```

## Structure to Follow

- Keep URL routes, route layouts, loading and error boundaries, and route-specific UI under `app/`, following the App Router file conventions.
- Keep the root layout and global CSS in `app/layout.tsx` and `app/globals.css`.
- As the app grows, group reusable UI in `components/`, shared helpers in `lib/`, and shared TypeScript definitions in `types/`. Create these folders only when there is code to put in them.
- Keep reusable authentication UI in `components/auth/` and server session access in `lib/auth/`. Sessions are managed by Better Auth, and route protection stays server-side.
- Keep transactional email content in `lib/auth/email-templates.ts` and the Resend transport in `lib/auth/email.ts`. The template module is pure and owns the shared table layout, email-only palette, escaping, safe-URL validation, and the verification, welcome, and sign-in-alert bodies. The transport reads `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_REPLY_TO`, sends one raw `fetch` request with a 10-second timeout, and never exposes the key. Better Auth triggers the welcome from `emailVerification.afterEmailVerification` and the alert from `databaseHooks.session.create.after` only when the user already has more than one active session. There is deliberately no welcome ledger, outbox, retry queue, or delivery webhook: verification is once-per-account and welcome/alert delivery is best effort.
- Put every signed-in page under the `app/(workspace)/` route group so it inherits the shared server session guard and `WorkspaceShell`. Keep `/login`, `/signup`, and the root `/` redirect outside the group because they are full-screen pre-authentication screens.
- Keep the workspace frame in `components/layout/WorkspaceShell.tsx`; it owns the sticky top navigation, account and mobile disclosures, page header, skip link, and `<main id="workspace-content">` region. Pages under the group render only their content. Keep disclosure state in the shell and return focus to the trigger when Escape closes a panel.
- Keep workspace navigation records, page labels, and titles in `lib/navigation.ts`; the top navigation, mobile menu, shell header, and account panel must read that single source rather than maintaining duplicate maps. Records with `inPrimaryNav: false` (currently `/profile`) still supply page metadata but render only from the account panel, not as primary tabs. Keep the page-to-icon mapping in `WorkspaceShell.tsx` and never fall back to the dashboard icon for another route.
- Keep the dashboard summary strip and applications trend chart in `components/dashboard/`, and application types, summary, and weekly trend helpers in `lib/applications.ts`. The summary reads the summary object only and the chart reads the weekly helper; neither recounts statuses. Use `recharts` as the single chart library for chart UI. The dashboard page is a Server Component; only the interactive chart is a Client Component.
- Keep Profile UI in `components/profile/`: `ProfileSummary` renders the read-only identity card and `PersonalDetailsForm` owns the client-side form state. Keep profile types, limits, initials, UTC member-since formatting, email-verification state, and serializers in `lib/profile.ts`; the personal-details schema in `lib/validators/profile.ts`; the testable lazy-upsert logic in `lib/repositories/profiles-core.ts`; the server-only wrapper in `lib/repositories/profiles.ts`; and save orchestration in `lib/profile-save.ts`. `app/(workspace)/profile/page.tsx` is a dynamic Server Component that re-checks the session and reads the owner's profile before passing serialized values to the form. The Server Action derives the user from `auth.api.getSession`, saves the profile first, then updates the canonical name through `auth.api.updateUser` only when it changed. Better Auth's `nextCookies()` plugin is required so the refreshed cached session cookie is persisted for `router.refresh()`. A name-only failure returns the partial result and keeps the saved profile fields.
- Use the text `JobFlow` wordmark with the accent dot and Lucide for every icon. Store only files that should be served as-is in `public/`; there are no logo images, Lottie files, or sidebar brand tiles.
- Keep server-only integrations and secrets out of client components. Read configuration from environment variables and never commit secret values.
- Keep MongoDB access in `lib/db/`: one cached `MongoClient` per process, explicit collection names, and the six domain collections plus `migrate-mongo`'s `changelog`. Use environment-suffixed database names (`jobflow_dev`, `jobflow_test`, `jobflow_preview`, `jobflow_prod`). Create indexes through `migrations/`, never ad hoc Atlas UI edits; do not rewrite an applied migration. The server-only repository is the ownership boundary and must reject future application dates instead of clamping them. Profiles are owner-scoped by a unique `userId` index and are created lazily on the first successful Personal details save; reads must never create a document.
- Prefer Server Components. Mark a component with `"use client"` only when it needs browser APIs, state, effects, or interactive event handlers.
- Use the configured `@/*` alias for imports from the repository root. Keep modules focused and avoid duplicating shared behavior.

## Change Guidance

Before changing app code, consult the relevant Next.js 16 guide in `node_modules/next/dist/docs/`. Update this document when the project adopts a lasting structural change. Run `npm test` and `npm run lint`, and run `npm run build` for changes affecting routes or production behavior. When a change touches the profiles collection or its lazy-upsert logic, also run `npm run test:integration` against the dedicated `jobflow_test` database; that suite creates a uniquely named collection and drops it afterwards.
