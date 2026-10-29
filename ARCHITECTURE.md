# Application Architecture

## Current Structure

```text
next-ai-lab/
├── app/                 # App Router routes, layouts, and global styles
│   ├── (workspace)/     # URL-transparent signed-in route group
│   │   ├── layout.tsx   # Shared auth guard, sidebar shell, and page header
│   │   └── dashboard/page.tsx # Dashboard route
│   ├── page.tsx         # Routes / to login or dashboard
│   ├── login/page.tsx   # Login route
│   ├── signup/page.tsx  # Signup route
│   ├── layout.tsx       # Root HTML shell and shared layout
│   ├── globals.css      # Global styles
│   └── favicon.ico      # Application icon
├── components/
│   ├── auth/            # Reusable auth layouts, controls, forms, and route guard
│   ├── dashboard/       # Dashboard summary widgets and trend chart
│   └── layout/          # Signed-in workspace shell and sidebar
├── lib/                 # Shared auth, application, database, navigation, summary, and trend helpers
│   ├── db/              # Cached MongoClient, database accessors, stored document types
│   └── validators/      # Server-side input guards shared by repositories and routes
├── migrations/          # migrate-mongo index migrations; never edit an applied migration
├── scripts/             # Operational checks such as the Atlas connectivity check
├── public/              # Static assets served from the site root
│   ├── animations/      # Local Lottie animation assets
│   └── images/          # Expanded and collapsed JobFlow logo marks
├── AGENTS.md            # Contributor guide
├── RULES.md             # Development rules
├── SYSTEM_DESIGN.md     # Shared UI and visual design standards
├── architecture.nd     # This architecture guide
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
- Keep reusable authentication UI in `components/auth/` and browser-only session behavior in `lib/auth.ts`. The current session is a `sessionStorage` prototype marker, not a production authorization boundary.
- Put every signed-in page under the `app/(workspace)/` route group so it inherits the shared `AuthRoute` guard and `WorkspaceShell`. Keep `/login`, `/signup`, and the root `/` redirect outside the group because they are full-screen pre-authentication screens.
- Keep the workspace frame in `components/layout/WorkspaceShell.tsx`; it owns the sidebar, page header, skip link, and `<main id="workspace-content">` region. Pages under the group render only their content. Keep the in-memory sidebar collapsed state in the shell so it survives route changes and resets on reload.
- Keep workspace navigation records, page labels, titles, and descriptions in `lib/navigation.ts`; the sidebar and shell header must read that single source rather than maintaining duplicate maps.
- Keep dashboard summary widgets and the applications trend chart in `components/dashboard/`, and application types, sample records, summary, and weekly trend helpers in `lib/applications.ts`. Widgets read the summary object only and the chart reads the weekly helper; neither recounts statuses. Use `recharts` as the single chart library for chart UI. The dashboard page remains client-side because its time-relative sample data and trend chart run in the client.
- Store images, icons, and other files that should be served as-is in `public/`; reference them by root-relative URL paths. Use `expandedLogo.jpg` and `collapsedLogo.jpg` for the workspace brand tiles.
- Keep server-only integrations and secrets out of client components. Read configuration from environment variables and never commit secret values.
- Keep MongoDB access in `lib/db/`: one cached `MongoClient` per process, explicit collection names, and the five domain collections plus `migrate-mongo`'s `changelog`. Use environment-suffixed database names (`jobflow_dev`, `jobflow_test`, `jobflow_preview`, `jobflow_prod`). Create indexes through `migrations/`, never ad hoc Atlas UI edits; do not rewrite an applied migration. The server-only repository is the ownership boundary and must reject future application dates instead of clamping them.
- Prefer Server Components. Mark a component with `"use client"` only when it needs browser APIs, state, effects, or interactive event handlers.
- Use the configured `@/*` alias for imports from the repository root. Keep modules focused and avoid duplicating shared behavior.

## Change Guidance

Before changing app code, consult the relevant Next.js 16 guide in `node_modules/next/dist/docs/`. Update this document when the project adopts a lasting structural change. Run `npm run lint`, and run `npm run build` for changes affecting routes or production behavior.
