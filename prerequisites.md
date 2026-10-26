# Prerequisites

Everything needed to run JobFlowAI locally, and the agent skills required for the
AI-assisted implementation workflow defined in `AGENTS.md` and `RULES.md`.

## 1. Runtime and Tooling

| Requirement | Version | Needed for | Notes |
| --- | --- | --- | --- |
| Node.js | 20.9 or newer (LTS recommended) | Dev server, build, tests | Verified on `v20.14.0`. Next.js 16 requires 20.9+. |
| npm | 10 or newer | Installing dependencies, running scripts | Ships with Node.js. Verified on `10.8.1`. |
| Git | 2.x | Cloning and version control | Recommended, not required to run the app. |
| Modern browser | Latest Chrome, Edge, Firefox, or Safari | Viewing the app | Needs `sessionStorage` support for the mock auth session. |
| Python 3 | 3.x (optional) | `suggest-lucide-icons` catalog search script | No third-party packages required. Only needed while picking icons. |
| Internet access | — | `npm install` and the Lucide catalog lookup | The running app itself has no network dependency. |

Not required today: Docker, a database server, or cloud accounts. Authentication is a
`sessionStorage` mock and dashboard data is static sample data in `lib/applications.ts`.

## 2. Environment Variables

No environment variables are read by the current codebase, so no `.env.local` file is
required to run the app.

- `.gitignore` excludes `.env*`, so local secrets are never committed.
- When real integrations are added, document each variable name here and commit an
  `.env.example` with blank values. Never commit real values.
- Server-only secrets must stay out of `"use client"` components.

## 3. Setup

Run from the repository root:

```bash
npm install
npm run dev
```

The dev server listens on <http://localhost:3000>. If 3000 is occupied, pass the port
through npm: `npm run dev -- -p 3001`.

## 4. Validation Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack. |
| `npm run build` | Production build. Required for route or rendering changes. |
| `npm start` | Serve the production build (run `npm run build` first). |
| `npm run lint` | ESLint with Next.js Core Web Vitals and TypeScript rules. |
| `npm test` | `node:test` specs for `lib/auth` and `lib/applications`. |

No DOM test runner is installed yet, so component-level specs are deferred and recorded
as a documented exception in `PRD.md`.

## 5. Agent Skills Required for AI-Based Implementation

These skills are mandated by `RULES.md`. They are not npm dependencies; they are Agent
Skills (a folder with a `SKILL.md`) that the coding agent loads on demand.

| Skill | Required by | Purpose |
| --- | --- | --- |
| `ponytail` | `RULES.md` line 7 — every change or update | Enforces the laziest viable solution: understand the flow first, then write the minimum code, never sacrificing validation, security, or accessibility. |
| `grill-me` | `RULES.md` line 9 — requirement, plan, or design review | Interviews you relentlessly until every branch of a requirement is resolved. Requires a linked task under **To Do** in `TASKS.md` before the interview starts. |
| `better-ui` | `RULES.md` line 19 — every new or changed component | Supplies exact values for alignment, geometry, radius, spacing, shadows, icon stroke, and motion. Polish never outranks a broken interaction. |
| `suggest-lucide-icons` | `RULES.md` line 20 — every icon added | Confirms a real Lucide icon name before use, so no invented names and no mixed icon libraries. `lucide-react` is the single icon source. |

### Sources and Install Commands

| Skill | Upstream source | Install command |
| --- | --- | --- |
| `ponytail` | [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) → `skills/ponytail` | `npx skills add DietrichGebert/ponytail --skill ponytail` |
| `grill-me` | [`mattpocock/skills`](https://github.com/mattpocock/skills) → `skills/productivity/grill-me` | `npx skills add mattpocock/skills --skill grill-me` |
| `better-ui` | [`jakubkrehel/skills`](https://github.com/jakubkrehel/skills) → `skills/better-ui` | `npx skills add jakubkrehel/skills --skill better-ui` |
| `suggest-lucide-icons` | [`nweii/agent-stuff`](https://github.com/nweii/agent-stuff) → `skills/suggest-lucide-icons` | `npx skills add nweii/agent-stuff --skill suggest-lucide-icons` |

`better-ui` and `suggest-lucide-icons` ship supporting files (`surfaces.md`,
`animations.md`, `icons.md`, `scripts/lucide.py`, and others). Keep each skill in its
own directory so those relative paths resolve.

### Where OpenCode Finds Skills

| Scope | Directories |
| --- | --- |
| Global | `~/.config/opencode/skills/` |
| Global compatibility | `~/.claude/skills/`, `~/.agents/skills/` |
| Project | `.opencode/skills/`, `.claude/skills/`, `.agents/skills/` |

Use the directory form `<skill-name>/SKILL.md`; the folder name becomes the skill ID.
Global installation makes the skills available to every project, which matches the
user-level path cited in `RULES.md`.

> **Action required:** `RULES.md` line 7 points at
> `C:\Users\Nitish\.agents\skills\ponytail\SKILL.md`. That path belongs to a different
> Windows profile and does not exist on this machine. Update it to the real install
> location, for example
> `C:\Users\NitishHatode\.config\opencode\skills\ponytail\SKILL.md`.

### Invoking a Skill

- Automatic: the agent loads a skill when the task matches its description.
- Explicit: mention `@skill-id` in a prompt, such as `@better-ui`.
- `grill-me` is user-invoked. Start it only when a linked task exists under **To Do**
  in `TASKS.md`, and move that task to **Ready for Code** when the grilling resolves
  the requirement.
