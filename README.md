# JobFlowAI

**JobFlowAI** is a modern job application tracking platform built with Next.js, React, and TypeScript. It aims to help job seekers organize applications, track progress, and manage their job search through a clean, responsive dashboard.

The project is also a learning environment for modern web development and structured AI-assisted coding using Codex.

## Features

- **Authentication prototype** — Login and signup screens with form validation.
- **Dashboard** — A starting point for managing job search activity.
- **Responsive design** — Layouts designed for desktop and mobile.
- **Ocean Depths theme** — A consistent visual system for colors, typography, and spacing.
- **Lottie animations** — Custom animations with reduced-motion fallbacks.
- **AI-assisted development** — Documented requirements, architecture, coding rules, and task tracking.

> **Current status:** Authentication is a mock prototype. Production-ready authentication and persistent job application storage have not yet been implemented unless separately documented in the codebase.

## Tech Stack

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- MongoDB Atlas with the native `mongodb` driver
- Better Auth
- ESLint
- Lottie animations

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
| `MONGODB_DB` | No | Database name; defaults to `jobflow` |
| `BETTER_AUTH_SECRET` | Yes | Long random secret used by Better Auth |
| `BETTER_AUTH_URL` | Yes | Base URL of the app, for example `http://localhost:3000` |

Get the host from **Database → Connect → Drivers**. Credentials are passed to the
driver separately from the URI, so special characters in the password do not need
URL-encoding. `.env.local` is gitignored; never commit real credentials. The server
fails fast with a clear error when a required variable is missing.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint, if configured
npm run db:check # Verify the MongoDB connection from .env.local
```

Check `package.json` for the commands configured in the current project.

## Project Structure

```text
JobFlowAI/
├── public/                 # Static assets
├── src/
│   └── app/                # Next.js App Router
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

## Current Authentication Prototype

The current prototype includes:

- Email-based mock login
- Signup form with validation
- Password visibility controls
- Disabled Google sign-in option
- Session-scoped authentication state
- Client-side route guards
- Dashboard entry point
- Responsive Ocean Depths styling
- Custom Lottie animations with reduced-motion support

Refer to `PRD.md` for detailed requirements and any outstanding decisions.

## Roadmap

Future development is tracked in `TASKS.md` and governed by `PRD.md`.

Potential improvements include:

- Production-ready authentication
- Persistent database integration
- Job application CRUD operations
- Application status tracking
- Search, filtering, and sorting
- Dashboard statistics
- Automated testing and improved error handling

## Security Notes

- Never commit API keys, credentials, or private tokens.
- Keep sensitive configuration in environment variables.
- Never expose server-only credentials to client-side code.
- Client-side route guards are not a substitute for server-side authorization.
- Implement secure authentication, authorization, and input validation before handling real user accounts or sensitive data.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
