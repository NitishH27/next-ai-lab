# Application Architecture

## Current Structure

```text
next-ai-lab/
├── app/                 # App Router routes, layouts, and global styles
│   ├── page.tsx         # Routes / to login or dashboard
│   ├── login/page.tsx   # Login route
│   ├── signup/page.tsx  # Signup route
│   ├── dashboard/page.tsx # Dashboard route
│   ├── layout.tsx       # Root HTML shell and shared layout
│   ├── globals.css      # Global styles
│   └── favicon.ico      # Application icon
├── components/auth/     # Reusable auth layouts, controls, forms, and route guard
├── lib/                 # Shared auth validation and mock-session helpers
├── public/              # Static assets served from the site root
│   └── animations/      # Local Lottie animation assets
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
- Store images, icons, and other files that should be served as-is in `public/`; reference them by root-relative URL paths.
- Keep server-only integrations and secrets out of client components. Read configuration from environment variables and never commit secret values.
- Prefer Server Components. Mark a component with `"use client"` only when it needs browser APIs, state, effects, or interactive event handlers.
- Use the configured `@/*` alias for imports from the repository root. Keep modules focused and avoid duplicating shared behavior.

## Change Guidance

Before changing app code, consult the relevant Next.js 16 guide in `node_modules/next/dist/docs/`. Update this document when the project adopts a lasting structural change. Run `npm run lint`, and run `npm run build` for changes affecting routes or production behavior.
