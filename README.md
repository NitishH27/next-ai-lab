# JobFlowAI

**JobFlowAI** is a modern job application tracking platform built with Next.js, React, and TypeScript. It aims to help job seekers organize applications, track progress, and manage their job search through a clean, responsive dashboard.

The project is also a learning environment for modern web development and structured AI-assisted coding using Codex.

## Features

- **Email/password authentication** — Signup, email verification, sign-in, sessions, and route guards.
- **Applications tracker** — Create, edit, delete, search, and sort job applications.
- **Dashboard** — Summary metrics and a 12-week application activity chart.
- **Profile personal details** — View and edit your name, headline, location, website, and LinkedIn, with a read-only verified email; reachable from the account menu.
- **Sticky top navigation** — Dashboard and Applications links, an account menu with Profile and sign-out, and a mobile menu.
- **Responsive design** — Layouts designed for desktop and mobile, including keyboard, RTL, and reduced-motion support.
- **Ink Navy theme** — A dark-only visual system with Plus Jakarta Sans, seafoam actions, and Lucide icons.
- **AI-assisted development** — Documented requirements, architecture, coding rules, and task tracking.

> **Current status:** Better Auth, MongoDB persistence, the applications tracker, and the Profile personal-details section are implemented. Remaining product work is tracked in `TASKS.md`.

## Tech Stack

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- MongoDB Atlas with the native `mongodb` driver
- Better Auth
- Recharts and AG Grid
- Plus Jakarta Sans, Tailwind CSS, and global design tokens
- Lucide icons
- ESLint

See `package.json` for the exact dependencies and available scripts.

## Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm
- Git (recommended)

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd JobFlowAI
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Copy the example file and fill in the required values:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas cluster host, without embedded credentials |
| `MONGODB_USER` | Yes | Atlas database user |
| `MONGODB_PASSWORD` | Yes | Atlas database password; kept literal, so `@` and other special characters are safe |
| `MONGODB_DB` | Deployed | Database name. Local default is `jobflow_dev`; use `jobflow_test`, `jobflow_preview`, or `jobflow_prod` per environment |
| `BETTER_AUTH_SECRET` | Yes | Long random secret used by Better Auth |
| `BETTER_AUTH_URL` | Yes | Base URL of the app, for example `http://localhost:3000` |
| `RESEND_API_KEY` | Production | Resend key for the verification, welcome, and new sign-in alert emails. Locally, omit it and the verification link is printed to the dev server console |
| `EMAIL_FROM` | No | Sender for transactional emails; defaults to `JobFlowAI <onboarding@resend.dev>`. Resend requires a verified domain for real recipients |
| `EMAIL_REPLY_TO` | Production | Reply address on all three transactional emails. Optional locally; required in production when `RESEND_API_KEY` is set |

Get the host from **Database → Connect → Drivers**. Credentials are passed to the
driver separately from the URI, so special characters in the password do not need
URL-encoding. `.env.local` is gitignored; never commit real credentials. The server
fails fast with a clear error when a required variable is missing.

Transactional emails go through Resend and use one shared, self-contained HTML
layout with a plain-text alternative. The three messages are:

- **Verification** — sent on sign-up. The link finishes account setup and expires
  in one hour. Without `RESEND_API_KEY`, local sign-up logs the verification URL
  to the dev server console instead of emailing it; open that link to activate
  the account before signing in. In production, a missing key fails the
  verification send loudly because the message is the only way to finish sign-up.
- **Welcome** — sent once when email verification completes, with a link to the
  dashboard. A verification token is a one-time transition, so there is no
  welcome-sent flag, collection, or delivery ledger. First sign-in does not send
  another welcome.
- **New sign-in alert** — sent after a successful sign-in only when the user
  already has another active session. The first session after sign-up or
  verification stays quiet, and session refreshes do not send an alert. The
  alert shows the account email, a UTC timestamp, and a short browser/OS label;
  it never includes the IP address, location, session token, or full user agent.

Welcome and alert delivery is best effort: failures are logged and swallowed so
they never fail verification or sign-in. No retry queue, outbox, delivery
webhook, or bounce handling is added. Use a Resend-verified domain for
`EMAIL_FROM` in production; `onboarding@resend.dev` is for development only.

Development, test, preview, and production each use an environment-suffixed
database: `jobflow_dev`, `jobflow_test`, `jobflow_preview`, and `jobflow_prod`.
Development, test, and preview share the M0 development cluster; production uses a
separate M10-or-higher cluster in `ap-south-1`. Run `npm run migrate:up` after
configuring a new database to create the six domain collections and their indexes
(seven collections including `migrate-mongo`'s `changelog`).

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Commands

```bash
npm run dev        # Start the development server
npm run build      # Create a production build
npm run start      # Start the production server
npm test           # Run the fast unit test suite
npm run test:integration # Run Atlas-backed integration tests against jobflow_test
npm run lint       # Run ESLint
npm run db:check   # Verify the MongoDB connection from .env files
npm run migrate:up # Apply pending index migrations
npm run migrate:down # Roll back the last migration
```

The integration suite reads `.env.local`, connects to the dedicated `jobflow_test`
database, creates a uniquely named profiles collection, and drops it afterwards. It
skips when `MONGODB_URI` is missing. Run both suites before shipping a change that
touches persistence.

Check `package.json` for the commands configured in the current project.

## Project Structure

```text
JobFlowAI/
├── app/                    # Next.js App Router routes, layouts, and global styles
├── components/             # Reusable auth, dashboard, profile, and workspace UI
├── lib/                    # Shared helpers
│   ├── db/                 # Cached MongoClient, database accessors, stored types
│   ├── integration/        # Atlas-backed integration tests
│   ├── repositories/       # Server-only, owner-scoped collection access
│   └── validators/         # Server-side input guards
├── migrations/             # migrate-mongo index migrations
├── scripts/                # Operational checks such as db:check
├── public/                 # Static assets served from the site root
├── AGENTS.md               # AI coding agent instructions
├── RULES.md                # Development and coding rules
├── ARCHITECTURE.md         # Application architecture
├── SYSTEM_DESIGN.md        # UI design system
├── PRD.md                  # Product requirements
├── TASKS.md                # Development backlog
├── CHANGLOG.md             # Development change history
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

The structure is illustrative. Keep it aligned with the actual repository, and rename `CHANGLOG.md` to `CHANGELOG.md` if the spelling was unintended.

## Development Workflow

JobFlowAI follows a documentation-first workflow for AI-assisted development.

1. **Define requirements:** Document features and acceptance criteria in `PRD.md`.
2. **Plan tasks:** Break requirements into manageable tasks in `TASKS.md`.
3. **Review instructions:** Follow `AGENTS.md` and `RULES.md`.
4. **Review architecture:** Consult `ARCHITECTURE.md` before changing application code.
5. **Follow the design system:** Use `SYSTEM_DESIGN.md` when implementing or updating UI components.
6. **Implement incrementally:** Make focused changes and avoid unrelated rewrites.
7. **Validate:** Run relevant linting, type checks, tests, and production builds.
8. **Document changes:** Update task status and the changelog.

## Project Documentation

| File | Purpose |
|---|---|
| `AGENTS.md` | Instructions for AI coding agents |
| `RULES.md` | Coding standards and quality requirements |
| `ARCHITECTURE.md` | Project structure and technical decisions |
| `SYSTEM_DESIGN.md` | Colors, typography, spacing, and accessibility |
| `PRD.md` | Product requirements and acceptance criteria |
| `TASKS.md` | Planned, in-progress, and completed tasks |
| `CHANGLOG.md` | Record of repository changes |

## Current Authentication and UI

The current implementation includes:

- Better Auth email/password signup, verification, sign-in, and sign-out
- Branded verification, welcome, and new sign-in alert emails through Resend
- MongoDB-backed users, sessions, and applications
- Server-side workspace guards and signed-in route protection
- Password visibility controls and a disabled Google sign-in option
- A centered dark auth column with responsive form controls
- A sticky top navigation bar with account and mobile menus
- A profile summary and Personal details form, reached from the account menu
- Dashboard metrics, status breakdown, and a 12-week activity chart
- An applications grid with search, sorting, row editing, and a create/edit drawer
- Keyboard focus, RTL, reduced-motion, and 200% zoom accommodations

Refer to `PRD.md` for detailed requirements and any outstanding decisions.

## Roadmap

Future development is tracked in `TASKS.md` and governed by `PRD.md`.

Potential improvements include:

- Professional details, resume, and job-preference management
- Production rate limiting, monitoring, and a shared limiter store
- Account security and account deletion
- Automated component and integration tests
- Expanded reporting and application-status history

## Security Notes

- Never commit API keys, credentials, or private tokens.
- Keep sensitive configuration in environment variables.
- Never expose server-only credentials to client-side code.
- Client-side route guards are not a substitute for server-side authorization.
- Implement secure authentication, authorization, and input validation before handling real user accounts or sensitive data.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
