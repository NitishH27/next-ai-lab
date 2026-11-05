# JobFlowAI — A Complete Beginner's Guide

This document explains the whole project from the ground up. It assumes you have
never used Next.js, React, or MongoDB before. Read it top to bottom the first
time; later you can jump to the section you need.

> **What this file covers:** what Next.js is, how this app uses it, how routing
> works, what the frontend and backend actually are, how authentication works,
> how MongoDB works, how the app connects to the database, how data flows through
> the system, and where every important file lives.
>
> **What this file is not:** a replacement for `PRD.md`, `ARCHITECTURE.md`, or
> `RULES.md`. Those are the product requirements, architecture decisions, and
> development rules. This file is the friendly explanation that ties them
> together.

---

## Table of contents

1. [The project in one page](#1-the-project-in-one-page)
2. [What is Next.js?](#2-what-is-nextjs)
3. [How this project uses Next.js](#3-how-this-project-uses-nextjs)
4. [Routing, explained from zero](#4-routing-explained-from-zero)
5. [Frontend and backend: who does what](#5-frontend-and-backend-who-does-what)
6. [Authentication and sessions](#6-authentication-and-sessions)
7. [MongoDB, explained from zero](#7-mongodb-explained-from-zero)
8. [How this app connects to MongoDB](#8-how-this-app-connects-to-mongodb)
9. [The database schema and indexes](#9-the-database-schema-and-indexes)
10. [End-to-end data flows](#10-end-to-end-data-flows)
11. [Validation, serialization, and errors](#11-validation-serialization-and-errors)
12. [Environment variables and local setup](#12-environment-variables-and-local-setup)
13. [The project folder map](#13-the-project-folder-map)
14. [UI, styling, and accessibility](#14-ui-styling-and-accessibility)
15. [Testing and quality checks](#15-testing-and-quality-checks)
16. [Glossary](#16-glossary)
17. [Known gaps between docs and code](#17-known-gaps-between-docs-and-code)

---

## 1. The project in one page

**JobFlowAI** is a job-application tracking app. A person creates an account,
signs in, and sees a dashboard that summarizes their job search:

- how many applications they have sent
- how many are in screening or interview
- how many offers they have
- how many were rejected
- how many are still waiting for a reply
- a 12-week trend chart

The long-term product goal is a full tracker where users can add, edit, and
change the status of each application. The backend and API for that already
exist. The tracker screens do not exist yet.

### The tech stack

| Layer | Technology | Version | What it does here |
| --- | --- | --- | --- |
| Framework | Next.js | 16.4.2 | Routing, server rendering, API endpoints, build tooling |
| UI library | React | 19.3.0 | Builds the interface from components |
| Language | TypeScript | 5.x | JavaScript with type checking |
| Styling | Tailwind CSS + custom CSS | 4.x | Utility classes plus the dark Ink Navy design tokens in `app/globals.css` |
| Database | MongoDB Atlas | — | Stores users, sessions, and applications |
| MongoDB driver | `mongodb` (native) | 7.x | Talks to MongoDB directly; there is no ORM/Mongoose |
| Auth | Better Auth + Mongo adapter | 1.7.x | Signup, login, email verification, sessions |
| Validation | Zod | 4.x | Checks untrusted input at the server boundary |
| Charts | Recharts | 3.x | The dashboard trend chart |
| Icons | Lucide React | 1.x | All app icons |
| Motion | CSS transitions | — | Navigation underlines and disclosure panels, with reduced-motion overrides |
| Migrations | migrate-mongo | 14.x | Creates indexes in a repeatable way |
| Email | Resend | — | Sends verification emails in production |

### The 30-second mental model

Think of the app as a restaurant:

- **MongoDB** is the pantry. It stores the ingredients (data).
- **Next.js server code** is the kitchen. It reads the pantry, prepares data, and
  renders pages.
- **React client components** are the dining room. They handle what the guest
  sees and touches.
- **Route handlers** (`app/api/...`) are the waiters. They carry requests between
  the dining room and the kitchen.
- **Better Auth** is the host at the door. It checks who you are and gives you a
  table (a session cookie).

A single Next.js project contains both the kitchen and the dining room. That is
what "full-stack" means here.

### The big picture

```text
Browser
  │
  │  HTTP request (GET /dashboard, POST /api/applications, ...)
  ▼
Next.js server (Node.js)
  ├── Routing decides which file handles the URL
  ├── Server Components render HTML on the server
  ├── Route Handlers implement the JSON API
  ├── Better Auth checks the session cookie
  └── Repository layer (lib/repositories/applications.ts)
        │
        │  MongoDB driver (one cached connection)
        ▼
MongoDB Atlas
  └── jobflow_dev / jobflow_test / jobflow_preview / jobflow_prod
        ├── users
        ├── accounts
        ├── sessions
        ├── verification
        ├── applications
        └── changelog   (created by migrate-mongo)
```

---

## 2. What is Next.js?

### React first, then Next.js

**React** is a JavaScript library for building user interfaces out of small
pieces called **components**. A component is a function that returns markup:

```tsx
function Greeting() {
  return <h1>Hello, job seeker!</h1>;
}
```

**Next.js** is a framework built on top of React. React gives you components.
Next.js gives you everything around them:

- a router (URLs map to files)
- a server (so pages can be rendered before they reach the browser)
- API endpoints (so the same project can serve JSON)
- image and font optimization
- bundling and compiling
- production builds

Without Next.js you would have to assemble React, a router, a server, a build
tool, and an API layer yourself. Next.js gives you one project and one command.

### Server Components and Client Components

This is the most important Next.js idea to understand.

**Server Components** run only on the server. They can be `async`, can read the
database, and can use secrets. Their code is **not** sent to the browser. In the
App Router they are the default: if a file does not say `"use client"`, it is a
Server Component.

```tsx
// app/(workspace)/dashboard/page.tsx
export default async function DashboardPage() {
  const docs = await listApplications(session.user.id);
  return <ApplicationSummary summary={summary} />;
}
```

**Client Components** run in the browser. They are needed when you use state,
effects, event handlers, `window`, or browser-only libraries. They start with the
`"use client"` directive at the top of the file.

```tsx
"use client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  // ...
}
```

A useful rule:

| Need | Use |
| --- | --- |
| Read the database directly | Server Component |
| Read an environment secret | Server Component or route handler |
| `useState`, `useEffect`, `onClick`, `onChange` | Client Component |
| A chart library that needs the DOM | Client Component |
| A form with validation feedback | Client Component |
| A static page or layout | Server Component |

A Client Component can be imported by a Server Component. A Server Component
cannot be imported by a Client Component (but you can pass server-rendered
content as `children`).

### Rendering: what actually happens

1. The browser asks for `/dashboard`.
2. The Next.js server matches the URL to `app/(workspace)/dashboard/page.tsx`.
3. It runs the server layout and page, including database calls.
4. It produces HTML and a description of the component tree.
5. The browser paints the HTML immediately.
6. React **hydrates** the page: it attaches event handlers to the client
   components already on screen.
7. Later navigation happens without a full page reload. The server sends the
   new page's data, and React swaps the content.

This is why the dashboard can look instant even though the data comes from
MongoDB: the server fetched the data before sending the page.

### Next.js 16 specifics used here

- **App Router**: folders under `app/` define routes.
- **Async request APIs**: `headers()` and dynamic route `params` are
  asynchronous and must be awaited.
- **Typed layout props**: `app/layout.tsx` uses `LayoutProps<"/">`.
- **Route groups**: `(workspace)` groups routes without adding a URL segment.
- **Cache Components are disabled** in `next.config.ts` (`cacheComponents:
  false`). Authenticated pages are not statically cached.
- **Turbopack** is configured for CSS through `@tailwindcss/turbopack`.

---

## 3. How this project uses Next.js

The project is a single Next.js app with four kinds of code:

| Kind | Location | Runs where |
| --- | --- | --- |
| Pages and layouts | `app/` | Server (unless `"use client"`) |
| API route handlers | `app/api/` | Server |
| Reusable UI components | `components/` | Server or client, depending on the file |
| Shared logic | `lib/` | Mostly server; some pure helpers run anywhere |

The `lib/` folder is deliberately split by responsibility:

```text
lib/
├── applications.ts          # status types, summary math, trend buckets
├── auth.ts                  # client-side form validation helpers
├── auth/                    # Better Auth server config, client, email
├── constants/db.ts          # reads env values once
├── db/                      # MongoClient, database, collections, stored types
├── env.ts                   # validates required environment variables
├── navigation.ts            # top-nav links and page-title source of truth
├── repositories/            # the only code that queries `applications`
├── utils/serialization.ts   # BSON -> JSON-safe values
└── validators/              # Zod schemas for application input
```

### The `@/*` import alias

`tsconfig.json` maps `@/*` to the repository root:

```json
"paths": {
  "@/*": ["./*"]
}
```

So this:

```ts
import { getSession } from "@/lib/auth/server";
```

means:

```ts
import { getSession } from "./lib/auth/server";
```

The alias keeps imports stable when files move and avoids long `../../..` paths.

### Scripts

From `package.json`:

```bash
npm run dev          # start the development server at http://localhost:3000
npm run build        # create a production build
npm start            # run the production build
npm run lint         # run ESLint
npm run db:check     # connect to MongoDB and list collections
npm run migrate:up   # apply pending migrations
npm run migrate:down # roll back the last migration
npm test             # run the node:test unit specs
```

---

## 4. Routing, explained from zero

### Files become URLs

In the App Router, the folder structure under `app/` **is** the URL structure.
A folder becomes a route when it contains a `page.tsx` file.

```text
app/page.tsx                      → /
app/login/page.tsx                → /login
app/signup/page.tsx               → /signup
app/(workspace)/dashboard/page.tsx → /dashboard
```

Notice the `(workspace)` folder. Parentheses mean **route group**. A route group
organizes files and shares a layout, but it does **not** appear in the URL. That
is why the file path contains `(workspace)` but the URL is just `/dashboard`.

### The route table for this app

| URL | File | Type | Access |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Server page | Redirects to `/dashboard` or `/login` |
| `/login` | `app/login/page.tsx` | Client page | Public; redirects signed-in users to `/dashboard` in the browser |
| `/signup` | `app/signup/page.tsx` | Client page | Public; redirects signed-in users to `/dashboard` in the browser |
| `/dashboard` | `app/(workspace)/dashboard/page.tsx` | Server page | Requires a session |
| `/api/auth/*` | `app/api/auth/[...all]/route.ts` | Route handler | Better Auth endpoints |
| `/api/applications` | `app/api/applications/route.ts` | Route handler | `GET` list, `POST` create; requires a session |
| `/api/applications/:id` | `app/api/applications/[id]/route.ts` | Route handler | `PATCH` update, `DELETE` delete; requires a session |

### `page.tsx`, `layout.tsx`, and `route.ts`

These are the three most important file conventions:

- **`page.tsx`** — the actual page for a URL.
- **`layout.tsx`** — a wrapper shared by a page and everything below it. Layouts
  preserve their state across navigation.
- **`route.ts`** — a server endpoint that returns a `Response`/JSON instead of
  HTML. It exports functions named after HTTP methods: `GET`, `POST`, `PATCH`,
  `DELETE`.

### How layouts nest

The root layout wraps every route:

```text
app/layout.tsx
├── /login
├── /signup
├── /
└── app/(workspace)/layout.tsx
    └── /dashboard
```

`app/layout.tsx` provides the `<html>` and `<body>` shell, loads Plus Jakarta
Sans through `next/font/google`, and sets dark viewport metadata:

```tsx
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0B0F14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
```

`app/(workspace)/layout.tsx` provides the signed-in experience. It checks the
session and renders the sticky top-navigation shell:

```tsx
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <WorkspaceShell session={session}>{children}</WorkspaceShell>;
}
```

Because the login and signup pages are **outside** `(workspace)`, they do not get
the workspace top navigation. That is intentional: they are full-screen
pre-authentication pages.

### Dynamic segments

Square brackets mean "this part of the URL is a variable".

```text
app/api/applications/[id]/route.ts
```

A request to `/api/applications/66f0c1b2e4b0a1c2d3e4f501` gives the handler:

```ts
{ params }: { params: Promise<{ id: string }> }
```

In Next.js 16, `params` is a Promise, so the handler waits for it:

```ts
const { id } = await params;
```

A catch-all segment uses `[...name]`:

```text
app/api/auth/[...all]/route.ts
```

That one file handles every Better Auth endpoint under `/api/auth/`, such as
`/api/auth/sign-in/email`, `/api/auth/sign-up/email`, and
`/api/auth/get-session`. The `toNextJsHandler(auth)` helper wires Better Auth's
own router into Next.js:

```ts
export const { GET, POST } = toNextJsHandler(auth);
```

### Redirects

Redirects are how the app enforces navigation rules.

`app/page.tsx` decides where `/` goes:

```tsx
export default async function Home() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  redirect("/login");
}
```

`redirect()` throws a special Next.js signal. You do not need to `return` after
it; execution stops immediately.

The workspace layout redirects signed-out users to `/login`. The login and signup
pages do the reverse in the browser: they call `authClient.getSession()` and, if a
session exists, `router.replace("/dashboard")`.

### Metadata

The root layout exports metadata used for the browser tab and search engines:

```tsx
export const metadata: Metadata = {
  title: "JobFlow",
  description: "A calm workspace for your job search.",
};
```

---

## 5. Frontend and backend: who does what

### The short definition

- **Frontend** = code that runs in the browser. It draws the UI and reacts to the
  user.
- **Backend** = code that runs on the server. It owns the database, secrets, and
  trust decisions.

In this project both live in the same repository, but they are still separate
environments. The browser never receives `MONGODB_URI`, `MONGODB_PASSWORD`, or
`BETTER_AUTH_SECRET`.

### What is frontend here

| Frontend code | Why it is client-side |
| --- | --- |
| `components/auth/LoginForm.tsx` | Controlled inputs, submit handler, error state |
| `components/auth/SignupForm.tsx` | Controlled inputs, submit handler, success state |
| `components/auth/PasswordField.tsx` | Show/hide password state |
| `components/layout/WorkspaceShell.tsx` | Top-nav disclosures, sign-out, outside press, and Escape handling |
| `components/dashboard/ApplicationTrendChart.tsx` | Recharts needs the DOM and hover interaction |
| `app/login/page.tsx`, `app/signup/page.tsx` | Session check in an effect, then client redirect |

### What is backend here

| Backend code | Why it is server-side |
| --- | --- |
| `app/(workspace)/layout.tsx` | Reads the session and redirects before rendering |
| `app/(workspace)/dashboard/page.tsx` | Queries MongoDB for the signed-in user |
| `app/api/applications/route.ts` | Authenticates, validates, writes to MongoDB |
| `app/api/applications/[id]/route.ts` | Authenticates, validates, updates/deletes |
| `app/api/auth/[...all]/route.ts` | Better Auth's server endpoints |
| `lib/auth/config.ts` | Holds the auth secret and database adapter |
| `lib/db/*` | Holds the MongoDB connection |
| `lib/repositories/applications.ts` | The only code allowed to query applications |
| `lib/validators/applications.ts` | Server-side input validation |

Many files start with:

```ts
import "server-only";
```

The `server-only` package makes the build fail if that module is ever imported
into a Client Component. It is a guardrail, not just a convention.

### A request in slow motion

Example: the browser opens `/dashboard`.

```text
1. Browser → GET /dashboard (with the session cookie)
2. Next.js finds app/(workspace)/layout.tsx
3. Layout calls getSession()
4. getSession() calls auth.api.getSession({ headers })
5. Better Auth reads the cookie, looks up the sessions collection
6. No session? redirect("/login") and stop.
7. Session exists? render WorkspaceShell with the user.
8. Next.js renders app/(workspace)/dashboard/page.tsx
9. Page calls listApplications(session.user.id)
10. Repository builds { userId: ObjectId } and queries MongoDB
11. MongoDB returns documents
12. serializeApplication converts ObjectId/Date to strings
13. summarizeApplications() and getWeeklyApplicationCounts() compute numbers
14. Server Components render HTML
15. Client chart hydrates and becomes interactive
16. Browser shows the dashboard
```

### Forms: client checks are for UX, server checks are for truth

Login and signup validate in the browser first so users get fast feedback:

```ts
// lib/auth.ts
validateLogin(email, password)
validateSignup(fullName, email, password, confirmPassword)
```

That is convenience, not security. Anyone can bypass browser code. The real
decisions happen on the server:

- Better Auth validates the signup/login payload.
- Route handlers validate application input with Zod.
- The repository re-checks dates.
- MongoDB unique indexes enforce email uniqueness.

This layered approach is intentional: each layer catches a different kind of
mistake.

---

## 6. Authentication and sessions

### The concepts

- **Authentication** = proving who you are.
- **Authorization** = deciding what you are allowed to do.
- **Password hashing** = storing a one-way scramble of the password, never the
  password itself. Better Auth handles this.
- **Session** = a server-side record that says "this browser is signed in as this
  user."
- **Session cookie** = a small, HTTP-only cookie containing a session token. The
  browser sends it automatically with every request.
- **Email verification** = proving the person owns the email address before the
  account can be used.

### Better Auth configuration

The whole setup lives in `lib/auth/config.ts`. The important parts:

```ts
const sharedAuthOptions = {
  user: { modelName: "users" },
  account: { modelName: "accounts" },
  verification: { modelName: "verification" },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60,
    sendVerificationEmail,
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
};
```

What each piece means:

- `modelName` maps Better Auth's internal models to the exact MongoDB collection
  names. Without this, the adapter could create singular collections like
  `user` or `session` by accident.
- `requireEmailVerification: true` blocks sign-in until the email is verified.
- `expiresIn: 60 * 60` gives verification links a one-hour lifetime.
- `expiresIn: 60 * 60 * 24 * 30` gives sessions a 30-day server-side lifetime.
- `updateAge` refreshes the session record at most once per day.
- `cookieCache` caches the session in a signed cookie for five minutes to avoid
  a database round trip on every request. The database remains the source of
  truth.
- `advanced.useSecureCookies` and `defaultCookieAttributes` set `HttpOnly`,
  `SameSite=Lax`, `Secure` in production, and `Path=/`.

The adapter is connected to the same cached MongoDB client the rest of the app
uses:

```ts
const db = await getDb();
const client = await getMongoClient();

return betterAuth({
  database: mongodbAdapter(db, { client }),
  // ...
});
```

Sharing the client matters: it avoids opening a second connection pool and lets
Better Auth use the cluster's transaction support.

### The auth collections

| Collection | Written by | Holds |
| --- | --- | --- |
| `users` | Better Auth | Name, normalized email, `emailVerified`, timestamps |
| `accounts` | Better Auth | Provider identity and the password hash (`providerId: "credential"`) |
| `sessions` | Better Auth | Session token, `userId`, `expiresAt`, optional IP/user agent |
| `verification` | Better Auth | One-time email-verification tokens |

The app **reads** these only through Better Auth. It never writes them directly.
That keeps password and token rules in one place.

### Signup flow

```text
User fills the signup form
  │
  ├─ Browser validation (name, email, 8+ characters, matching passwords)
  │
  ▼
authClient.signUp.email({ name, email, password })
  │
  ▼
POST /api/auth/sign-up/email
  │
  ▼
Better Auth
  ├─ normalizes the email to lowercase
  ├─ hashes the password
  ├─ inserts one document into users
  ├─ inserts one credential document into accounts
  ├─ creates a verification token in verification
  └─ calls sendVerificationEmail()
        │
        ├─ RESEND_API_KEY present → send through Resend
        └─ no key in development → print the link to the server console
  │
  ▼
Browser shows: "Check your email to verify your account before signing in."
```

A duplicate email is rejected by the unique `users.email` index. The form maps
that error to a field-specific message on the email input.

### Email verification flow

```text
User opens the link from the email/console
  │
  ▼
GET /api/auth/verify-email?token=...
  │
  ▼
Better Auth
  ├─ finds the token in verification
  ├─ rejects it if expired (even if MongoDB's TTL cleanup has not run yet)
  ├─ sets users.emailVerified = true
  └─ deletes/consumes the token
  │
  ▼
User can now sign in
```

### Login flow

```text
User submits email + password
  │
  ├─ Browser validation
  │
  ▼
authClient.signIn.email({ email, password })
  │
  ▼
POST /api/auth/sign-in/email
  │
  ▼
Better Auth
  ├─ finds the user by email
  ├─ finds the credential account
  ├─ verifies the password hash
  ├─ checks emailVerified
  └─ creates a sessions document
  │
  ▼
Response sets an HTTP-only session cookie
  │
  ▼
Client router.replace("/dashboard")
```

Login failures always show the generic message **"Invalid email or password."**
The app does not reveal whether the email exists or whether it is unverified.
That prevents account enumeration.

### How a page knows you are signed in

`lib/auth/server.ts`:

```ts
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
```

`headers()` is Next.js's read-only view of the incoming request headers, including
the `Cookie` header. Better Auth extracts the token, validates it, and returns
`{ session, user }` or `null`.

The workspace layout is the main guard:

```tsx
const session = await getSession();
if (!session?.user) {
  redirect("/login");
}
```

The dashboard page checks again before querying:

```tsx
if (!session?.user?.id) {
  redirect("/login");
}
```

That second check is redundant in normal flow, but it makes the page safe if it
is ever rendered outside the workspace layout.

### Sign-out

The top navigation's account-panel sign-out button calls:

```ts
await authClient.signOut();
router.replace("/login");
```

Better Auth deletes the session document and clears the cookie. Because the
session lives in the database, signing out invalidates it for every tab that
shares the cookie.

### Session lifetime in plain English

- The cookie has no `Max-Age` or `Expires`, so it is a **browser-session cookie**:
  it normally disappears when the browser closes.
- The session document on the server expires after **30 days** regardless.
- The TTL index on `sessions.expiresAt` cleans up expired documents eventually.
- Code still checks `expiresAt` when validating, because TTL cleanup can lag by
  about a minute.

### What is intentionally not implemented

- Google sign-in (the button is disabled).
- Password reset.
- Account deletion.
- OAuth providers.
- Admin roles.

---

## 7. MongoDB, explained from zero

### What MongoDB is

MongoDB is a **document database**. Instead of tables and rows, it stores
**collections** of **documents**. A document is a JSON-like object:

```json
{
  "_id": "66f0c1b2e4b0a1c2d3e4f501",
  "company": "Northwind Labs",
  "role": "Frontend Engineer",
  "status": "interview"
}
```

The real stored values are BSON (Binary JSON), which adds types JSON does not
have, especially `ObjectId` and `Date`.

### SQL vs MongoDB vocabulary

| SQL idea | MongoDB idea | In this project |
| --- | --- | --- |
| Database | Database | `jobflow_dev` |
| Table | Collection | `applications` |
| Row | Document | One job application |
| Column | Field | `company`, `role`, `status` |
| Primary key | `_id` | BSON `ObjectId` |
| Foreign key | Reference field | `userId` pointing at `users._id` |
| Index | Index | `{ userId: 1, appliedAt: -1, _id: -1 }` |

MongoDB has **no foreign keys** and **no row-level security**. Nothing stops one
query from reading another user's document. That means the application code must
enforce ownership. In this project, the repository does that by including
`userId` in every filter.

### BSON types you will see

- **`ObjectId`** — a 12-byte identifier, usually shown as a 24-character hex
  string. `_id` and `userId` use it.
- **`Date`** — an exact point in time, stored in UTC.
- **`string`**, **`number`**, **`boolean`**, **`null`**, **arrays**, **objects** —
  the usual types.

At the API boundary, `ObjectId` becomes a string and `Date` becomes an ISO 8601
string. Browsers should never receive raw BSON.

### MongoDB Atlas

**Atlas** is MongoDB's hosted cloud service. You do not install a database
server locally. Instead:

1. Create a cluster in Atlas.
2. Create a database user with a username and password.
3. Allow network access (an IP access list).
4. Copy the connection string.
5. Put it in `.env.local`.

The project uses:

| Environment | Database | Cluster |
| --- | --- | --- |
| Local development | `jobflow_dev` | Development cluster (M0 is fine) |
| Automated tests | `jobflow_test` | Development cluster |
| Vercel preview | `jobflow_preview` | Development cluster |
| Production | `jobflow_prod` | Separate production cluster (M10+) |

The target region is `ap-south-1` (Mumbai) with Vercel functions in `bom1`, so
the database and the app run close together.

### The native driver

The app uses the official `mongodb` package directly:

```ts
import { MongoClient } from "mongodb";
```

It does **not** use Mongoose or another ODM. Why?

- fewer layers to learn and debug
- direct control over indexes, TTL, and queries
- Better Auth's Mongo adapter also expects a native client
- the schema is small and explicit in TypeScript

### Connection string vs credentials

This project splits the connection string from the username/password:

```env
MONGODB_URI=mongodb+srv://<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_USER=<db_user>
MONGODB_PASSWORD=<db_password>
```

Why? If the password contains `@`, `:`, `/`, or `?`, embedding it in a URI
requires URL-encoding. Passing credentials as driver options avoids that whole
class of bugs.

The options are built in `lib/db/client.ts`:

```ts
const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  ...(MONGODB_USER && MONGODB_PASSWORD
    ? {
        auth: { username: MONGODB_USER, password: MONGODB_PASSWORD },
        authSource: "admin",
      }
    : {}),
};
```

- `maxPoolSize: 10` limits how many connections one server process can open.
  Serverless platforms can create many processes, so a small pool protects Atlas.
- `serverSelectionTimeoutMS: 5000` fails in five seconds instead of hanging if the
  cluster is unreachable.
- `authSource: "admin"` is where Atlas database users are defined.

---

## 8. How this app connects to MongoDB

The connection is built in layers. Each layer has one job.

```text
.env.local
   │
   ▼
lib/env.ts                 reads and validates environment variables
   │
   ▼
lib/constants/db.ts        exports the validated values
   │
   ▼
lib/db/client.ts           creates and caches one MongoClient per process
   │
   ▼
lib/db/connect.ts          getDb() → client.db("jobflow_dev")
   │
   ▼
lib/db/collections.ts      getApplicationsCollection(), etc.
   │
   ▼
lib/repositories/applications.ts   the only application-data queries
```

### Step 1: environment variables

`lib/env.ts` runs when a server module imports it. It checks that
`MONGODB_URI`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` exist. It also:

- requires `MONGODB_USER` and `MONGODB_PASSWORD` to be set together
- defaults `MONGODB_DB` to `jobflow_dev`
- in deployed environments, requires `MONGODB_DB` and restricts it to the four
  allowed names
- skips the missing-variable crash during `next build`, so a build can run
  without production secrets

If something is missing, the app fails fast with a clear message instead of
mysteriously failing later.

### Step 2: constants

`lib/constants/db.ts` simply re-exports the validated values:

```ts
export const MONGODB_URI = env.MONGODB_URI;
export const MONGODB_DB_NAME = env.MONGODB_DB;
export const MONGODB_USER = env.MONGODB_USER;
export const MONGODB_PASSWORD = env.MONGODB_PASSWORD;
```

### Step 3: the cached client

Creating a new `MongoClient` for every request would open a new connection pool
each time and quickly exhaust Atlas connections. `lib/db/client.ts` creates one
promise and reuses it:

```ts
let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  // ... validate the URI ...

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, clientOptions);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, clientOptions);
    clientPromise = client.connect();
  }

  return clientPromise;
}
```

Why the `global` object in development? Next.js hot-reloads modules when you edit
files. A normal module variable would reset on every reload, leaking connections.
Attaching the promise to `global` keeps it alive across reloads. In production
there is no hot reload, so a module-level variable is enough.

Why cache at all? A serverless instance stays warm for a while and handles many
requests. Reusing the client lets those requests share the pool. A cold start
creates a new client, which is expected.

### Step 4: the database

```ts
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}
```

`client.db("jobflow_dev")` does not open a new connection. It returns a handle to
a database inside the already-connected client.

### Step 5: collections

`lib/db/collections.ts` gives each collection a named accessor:

```ts
export async function getApplicationsCollection() {
  const db = await getDb();
  return db.collection("applications");
}
```

Explicit names prevent typos and prevent the auth adapter from creating
differently-named collections.

### Step 6: the repository

`lib/repositories/applications.ts` is the **only** application code that queries
the `applications` collection. Route handlers and pages call repository
functions; they never build Mongo queries themselves.

```ts
export async function listApplications(userId: string) {
  const collection = await getApplicationsCollection();
  const uid = toObjectId(userId);
  if (!uid) return [];

  return collection
    .find({ userId: uid })
    .sort({ appliedAt: -1, _id: -1 })
    .toArray();
}
```

Every function takes `userId` and includes it in the filter:

- list: `{ userId }`
- create: inserts `userId`
- update: `{ _id, userId }`
- delete: `{ _id, userId }`

That is how per-user isolation is enforced. MongoDB itself will happily return
another user's document if you forget the filter, so the repository is a security
boundary, not just a convenience layer.

### What happens when the database is unavailable

- The driver waits up to five seconds for a server.
- The request fails and route handlers return a generic `500` response.
- Server pages throw, and Next.js shows an error boundary (or the dev error
  overlay).
- Errors are logged server-side without returning MongoDB details, stack traces,
  or secrets to the browser.

---

## 9. The database schema and indexes

### Collections

| Collection | Owner | Purpose |
| --- | --- | --- |
| `users` | Better Auth | One document per account |
| `accounts` | Better Auth | One document per provider identity; holds the password hash |
| `sessions` | Better Auth | Server-side sessions for revocation and expiry |
| `verification` | Better Auth | One-time verification tokens |
| `applications` | JobFlow app | One document per job application |
| `changelog` | migrate-mongo | Records which migrations have run |

### The `applications` document

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

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary key; serialized as a string |
| `userId` | ObjectId | Owner; always derived from the session, never from the request body |
| `company` | string | Trimmed, 1–200 characters |
| `role` | string | Trimmed, 1–200 characters |
| `appliedAt` | Date | Must not be in the future |
| `status` | string | One of the six statuses; defaults to `applied` |
| `statusChangedAt` | Date | Equals `appliedAt` on create; changes only on a status change |
| `createdAt` | Date | Server time at insert |
| `updatedAt` | Date | Server time at every update |

### The six statuses

```text
applied → screening → interview → offer
                    ↘ rejected
applied/screening/interview/offer → withdrawn
```

The allowed values are:

```ts
"applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn"
```

They are stored as readable strings, not numeric codes, so a raw database
document is easy to understand.

### Relationships

```text
users 1 ──── N accounts       (accounts.userId)
users 1 ──── N sessions       (sessions.userId)
users 1 ──── N applications   (applications.userId)
verification                  (standalone, keyed by identifier)
```

These are **references**, not embedded arrays. A user's applications are not
stored inside the user document because that array could grow without limit and
hit MongoDB's 16 MB document limit well before a real job search does.

### Indexes

An index is a lookup structure that makes queries fast. Without one, MongoDB must
scan every document (a `COLLSCAN`).

| Collection | Index | Options | Why |
| --- | --- | --- | --- |
| `users` | `{ email: 1 }` | unique | Prevent duplicate accounts; fast login lookup |
| `sessions` | `{ token: 1 }` | unique | Find a session by cookie token |
| `sessions` | `{ userId: 1 }` | — | Find all sessions for a user |
| `sessions` | `{ expiresAt: 1 }` | TTL, `expireAfterSeconds: 0` | Delete expired sessions |
| `accounts` | `{ userId: 1 }` | — | Find a user's provider accounts |
| `accounts` | `{ providerId: 1, accountId: 1 }` | unique | One identity per provider/account |
| `verification` | `{ identifier: 1 }` | — | Find a verification token |
| `verification` | `{ expiresAt: 1 }` | TTL, `expireAfterSeconds: 0` | Delete expired tokens |
| `applications` | `{ userId: 1, appliedAt: -1, _id: -1 }` | — | List one user's applications newest first |
| `applications` | `{ userId: 1, status: 1 }` | — | Filter or count by status |

The applications index starts with `userId`, so no separate `{ userId: 1 }` index
is needed.

TTL indexes delete documents in the background, but cleanup can lag. The auth
code still compares `expiresAt` with the current time, so an expired session is
rejected even before the TTL monitor removes it.

### Migrations with migrate-mongo

Migrations are versioned JavaScript files that change the database in a
repeatable way. They live in `migrations/`:

```text
migrations/
├── 20251026000000-init-indexes.js
└── 20261029000000-add-auth-indexes.js
```

Each file exports `up` and `down`:

```js
module.exports = {
  async up(db) {
    await db.collection("users").createIndex(
      { email: 1 },
      { unique: true, name: "users_email_unique" },
    );
  },
  async down(db) {
    await db.collection("users").dropIndex("users_email_unique");
  },
};
```

`migrate-mongo` records applied files in the `changelog` collection, so running
`npm run migrate:up` twice is safe: the second run does nothing for files already
recorded.

Rules followed by this project:

- Never edit a migration that has already been applied. Add a new one.
- Every migration has one purpose.
- `down` drops only what `up` created; it never drops collections or user data.
- Migrations run as an explicit deploy step, not automatically during
  `next build` or a request.

`migrate-mongo-config.js` loads `.env.local` and `.env`, then connects with the
same `MONGODB_URI`, `MONGODB_USER`, `MONGODB_PASSWORD`, and `MONGODB_DB` as the
app.

### Verifying the database

```bash
npm run db:check
```

`scripts/check-db.mjs` connects, pings the `admin` database, and lists the
collections in `MONGODB_DB`. It is a quick way to separate "my app is broken" from
"my database credentials are wrong."

To inspect indexes manually, use `mongosh` or the Atlas UI. After migrations you
should see the indexes in the table above.

---

## 10. End-to-end data flows

### Flow 1: Dashboard read

```text
GET /dashboard
  → app/(workspace)/layout.tsx
      → getSession()
      → no session? redirect("/login")
      → session? render WorkspaceShell
  → app/(workspace)/dashboard/page.tsx
      → getSession() again
      → listApplications(session.user.id)
          → getApplicationsCollection()
              → getDb()
                  → getMongoClient()
                      → cached MongoClient
          → collection.find({ userId }).sort({ appliedAt: -1, _id: -1 })
      → serializeApplication() for each document
      → summarizeApplications(applications)
      → getWeeklyApplicationCounts(applications)
      → <ApplicationSummary summary={...} />
      → <ApplicationTrendChart data={...} />
  → HTML sent to the browser
  → the chart hydrates as a Client Component
```

### Flow 2: Create an application through the API

A future tracker screen will call this endpoint. You can also call it with
`fetch` or curl while signed in.

```text
POST /api/applications
{ "company": "Acme", "role": "Frontend Engineer", "appliedAt": "2026-10-30" }
  │
  ▼
app/api/applications/route.ts
  ├─ getSession() → no session? 401
  ├─ parse JSON
  ├─ createApplicationSchema.safeParse(body)
  │    └─ invalid? 400 with field errors
  ├─ appliedAt in the future? 400
  ├─ createApplication(session.user.id, data)
  │    ├─ getApplicationsCollection()
  │    ├─ assertAppliedAtNotFuture()
  │    ├─ insertOne({
  │    │    userId,
  │    │    company,
  │    │    role,
  │    │    appliedAt,
  │    │    status: "applied",
  │    │    statusChangedAt: appliedAt,
  │    │    createdAt: now,
  │    │    updatedAt: now
  │    │  })
  │    └─ findOne({ _id, userId })
  ├─ serializeApplication(doc)
  └─ 201 { application: { id, company, role, appliedAt, status, statusChangedAt } }
```

### Flow 3: Update an application

```text
PATCH /api/applications/:id
{ "status": "interview" }
  │
  ▼
app/api/applications/[id]/route.ts
  ├─ getSession() → 401 if signed out
  ├─ await params → id
  ├─ updateApplicationSchema.safeParse(body)
  ├─ reject a future appliedAt
  ├─ updateApplication(session.user.id, id, updates)
  │    ├─ convert id and userId to ObjectId
  │    ├─ findOne({ _id: id, userId }) → not found? null
  │    ├─ build $set with updatedAt
  │    ├─ if status changed, set statusChangedAt = now
  │    └─ updateOne({ _id, userId }, { $set })
  └─ 200 { application } or 404
```

Important rules:

- Editing `company`, `role`, or `appliedAt` does **not** change
  `statusChangedAt`.
- Sending the same status again does not change `statusChangedAt`.
- A malformed ObjectId returns `404`, not a crash.
- Another user's record also returns `404`, so the API never confirms that it
  exists.

### Flow 4: Delete an application

```text
DELETE /api/applications/:id
  → getSession() → 401 if signed out
  → deleteOne({ _id: id, userId })
  → deletedCount === 1 ? 200 { success: true } : 404
```

### Flow 5: Sign out

```text
Click "Sign out"
  → authClient.signOut()
      → POST /api/auth/sign-out
      → Better Auth deletes the sessions document
      → response clears the cookie
  → router.replace("/login")
```

---

## 11. Validation, serialization, and errors

### Validation layers

```text
Browser form validation        fast feedback, not a security boundary
        │
Zod schema at API boundary     untrusted JSON → typed, checked data
        │
Repository assertions          business rules that must never be skipped
        │
Unique MongoDB indexes         race-safe database-level constraints
        │
Serialization boundary         BSON → JSON-safe responses
```

### The application schemas

`lib/validators/applications.ts` defines:

- `company`: trimmed string, 1–200 characters
- `role`: trimmed string, 1–200 characters
- `appliedAt`: coerced to a valid `Date`
- `status`: one of the six strings, defaulting to `applied`
- update: all fields optional, but at least one must be present

A future `appliedAt` is **rejected**, not silently changed to "now". Clamping
would hide a client bug and make the stored date disagree with what the user
submitted.

### Serialization

MongoDB returns BSON types. JSON responses need strings.

`lib/utils/serialization.ts`:

```ts
serializeApplication(doc)
```

returns:

```ts
{
  id: "66f0c1b2e4b0a1c2d3e4f501",
  company: "Northwind Labs",
  role: "Frontend Engineer",
  appliedAt: "2026-10-01T00:00:00.000Z",
  status: "offer",
  statusChangedAt: "2026-10-08T09:30:00.000Z"
}
```

Notice what is **not** returned: `userId`, password hashes, session tokens, and
verification values. The client only needs its own application data.

### HTTP status codes used

| Status | Meaning in this app |
| --- | --- |
| `200` | Success |
| `201` | Application created |
| `400` | Invalid input (with field-safe messages) |
| `401` | Not signed in |
| `404` | Record not found, malformed id, or belongs to another user |
| `500` | Unexpected server error |

Error responses never include MongoDB error details, stack traces, or secrets.
The server logs the real error; the client gets a generic message.

### Summary math

The dashboard does not store counters. It computes them from the application
records every time, so the numbers cannot drift.

| Value | Formula |
| --- | --- |
| `sent` | Every application |
| `positive` | `screening + interview` |
| `offers` | `offer` |
| `rejected` | `rejected` |
| `awaiting` | `applied` |
| `withdrawn` | `withdrawn` |
| `resolved` | `positive + offers + rejected` |
| `responseRate` | `round((positive + offers) / resolved * 100)`, or `null` when nothing is resolved |
| `stale` | `applied` records that are 14 or more whole days old |

Invariant:

```text
positive + offers + rejected + awaiting + withdrawn = sent
```

### The 12-week trend

`getWeeklyApplicationCounts()` builds 12 trailing seven-day buckets ending today.

- Each record is bucketed by `appliedAt`.
- Only `applied`, `interview`, and `rejected` are plotted.
- `screening`, `offer`, and `withdrawn` are not plotted.
- Records older than 84 days or dated in the future are ignored.
- The chart uses the record's **current** status, not a historical transition.
  Accurate historical trends would need a status-history collection, which does
  not exist yet.

---

## 12. Environment variables and local setup

### Prerequisites

- Node.js 20.9 or newer
- npm
- Git (recommended)
- A MongoDB Atlas account and cluster

### Install

```bash
git clone <repository-url>
cd next-ai-lab
npm install
```

### Create the environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Then fill in real values.

### Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Atlas host, e.g. `mongodb+srv://cluster.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_USER` | Yes | Atlas database user |
| `MONGODB_PASSWORD` | Yes | Atlas password; kept literal so `@` is safe |
| `MONGODB_DB` | Deployed | `jobflow_dev`, `jobflow_test`, `jobflow_preview`, or `jobflow_prod`; defaults to `jobflow_dev` locally |
| `BETTER_AUTH_SECRET` | Yes | Long random secret for signing auth data |
| `BETTER_AUTH_URL` | Yes | Base URL, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | Production | Sends verification emails; without it, dev prints the link to the console |
| `EMAIL_FROM` | No | Sender address; defaults to `JobFlowAI <onboarding@resend.dev>` |

Generate a secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local` or real credentials. `.env.example` contains
placeholders only.

### Database setup

```bash
npm run db:check    # confirm the app can reach Atlas
npm run migrate:up  # create the indexes and collections
```

After migration, `jobflow_dev` should contain:

```text
accounts
applications
changelog
sessions
users
verification
```

### Run the app

```bash
npm run dev
```

Open <http://localhost:3000>. The root route redirects to `/login` or
`/dashboard` depending on the session.

### Production

```bash
npm run build
npm start
```

On Vercel, set the same variables in the project environment. Production uses
`jobflow_prod`, `Secure` cookies, and a real `RESEND_API_KEY`.

### Deploy checklist

1. Create the production Atlas cluster and `jobflow_prod` database.
2. Create a `readWrite` user limited to that database.
3. Add the Vercel deployment URL to `BETTER_AUTH_URL` and trusted origins.
4. Set all environment variables in Vercel.
5. Run migrations as a deliberate deploy step.
6. Verify a signup, verification email, login, dashboard, and sign-out.
7. Confirm no secrets appear in the client bundle.

---

## 13. The project folder map

```text
next-ai-lab/
├── app/
│   ├── (workspace)/
│   │   ├── layout.tsx           # session guard + workspace shell
│   │   └── dashboard/page.tsx   # server-rendered dashboard
│   ├── api/
│   │   ├── applications/
│   │   │   ├── route.ts         # GET list, POST create
│   │   │   └── [id]/route.ts    # PATCH update, DELETE delete
│   │   └── auth/[...all]/route.ts  # Better Auth endpoints
│   ├── login/page.tsx           # login screen
│   ├── signup/page.tsx          # signup screen
│   ├── layout.tsx               # root HTML shell + metadata
│   ├── page.tsx                 # / redirect
│   ├── globals.css              # Tailwind import + all design tokens/styles
│   └── favicon.ico
├── components/
│   ├── auth/                    # centered auth shell, forms, password field
│   ├── dashboard/               # summary strip + trend chart
│   └── layout/                  # signed-in sticky top-navigation shell
├── lib/
│   ├── applications.ts          # status types, summary, trend helpers
│   ├── auth.ts                  # browser form validation helpers
│   ├── auth/                    # Better Auth config, server/client, email
│   ├── constants/db.ts          # validated env exports
│   ├── db/                      # client, db, collections, stored types
│   ├── design-tokens.spec.mts   # palette, contrast, and raw-hex checks
│   ├── env.ts                   # environment validation
│   ├── navigation.ts            # top-nav links and page titles
│   ├── repositories/            # application data access
│   ├── utils/serialization.ts   # BSON -> JSON
│   └── validators/              # Zod schemas
├── migrations/                  # migrate-mongo index migrations
├── scripts/check-db.mjs         # connectivity check
├── public/                      # static assets served from the site root
├── .env.example                 # variable template (safe to commit)
├── .env.local                   # real local secrets (gitignored)
├── ARCHITECTURE.md              # structural decisions
├── AGENTS.md                    # instructions for AI coding agents
├── PRD.md                       # product requirements
├── RULES.md                     # development rules
├── SYSTEM_DESIGN.md             # Ink Navy design system
├── TASKS.md                     # implementation backlog
├── CHANGLOG.md                  # dated change history
├── detailedInfo.md              # this beginner guide
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript + @/* alias
├── eslint.config.mjs            # lint rules
├── migrate-mongo-config.js      # migration config
└── package.json                 # scripts and dependencies
```

---

## 14. UI, styling, and accessibility

### The Ink Navy dark theme

All colors are CSS custom properties in `app/globals.css`. The palette is
dark-only and is checked by `lib/design-tokens.spec.mts`:

```css
:root {
  color-scheme: dark;
  --canvas: #0b0f14;
  --surface: #11171e;
  --surface-raised: #18202a;
  --surface-hover: #1a222c;
  --surface-sunken: #0e141a;
  --text: #e6edf1;
  --text-muted: #9aa7b0;
  --border: #232d37;
  --border-control: #6b7a86;
  --border-strong: #8a9ba7;
  --primary: #a8dadc;
  --primary-hover: #bfe7e7;
  --accent: #7fd1cd;
  --accent-text: #9be0dc;
  --focus: #a8dadc;
  --success: #7fc79a;
  --warning: #e3b36a;
  --danger: #e58c8c;
  --info: #8cb8e0;
}
```

Components use `var(--token)` instead of raw hex values. Raw hex appears only
inside the `:root` block; the design-token spec enforces that for both global
CSS and the applications grid CSS. The retired `--surface-accent` token is
gone.

The root tokens also define the type scale, 8/12/16px radii, the overlay shadow,
120ms/150ms motion, and layout sizes such as the 64px navbar, 44px controls,
40px applications search, 44px grid header, 48px rows, 72rem content, 24rem
auth column, and 28rem drawer.

### Styling approach

- Tailwind CSS v4 is imported at the top of `globals.css`.
- Most of this app's layout and component styling is written as semantic classes
  in `globals.css` (for example `.workspace-header`, `.summary-grid`,
  `.auth-form`). The applications grid and drawer add scoped styles in
  `components/applications/applications-grid.css`.
- `SYSTEM_DESIGN.md` is the written standard: 4px spacing base, 8px control
  radius, 12px card radius, 16px overlay radius, 44px touch targets, and WCAG AA
  contrast.
- There is no sidebar, no light mode, and no Lottie asset. Primary navigation is
  a sticky top bar with a text wordmark, account panel, and mobile menu.

### Icons and charts

- **Lucide React** is the only icon library. Navigation icons are 18px, buttons
  and account controls are 16px, inline metadata is 14px, and empty states are
  20px, all with a 1.75px absolute stroke and `aria-hidden="true"` when a visible
  label already names the thing.
- **Recharts** is the only chart library. The "Application activity" chart is a
  Client Component with solid/dashed/dotted accent/danger/warning series, a
  pattern-matching legend, a hidden data table, and an empty-window message.

### Accessibility

- Skip link to `#workspace-content`, with scroll padding below the sticky bar.
- Semantic landmarks: `<header>`, `<nav>`, `<main>`; auth pages use `<main>`.
- One `<h1>` per page, supplied by the auth shell or workspace shell.
- Visible `:focus-visible` outlines on controls, links, grid cells, and the skip
  link.
- Status meaning never depends on color alone.
- `prefers-reduced-motion` removes underline scaling, disclosure motion, press
  scales, and drawer animation.
- Forms have persistent labels, `aria-invalid`, and `aria-describedby` error
  links.
- The mobile menu and account panel close on outside press and Escape; Escape
  returns focus to the trigger. Navigation uses logical inline properties for
  RTL.

---

## 15. Testing and quality checks

### Run the tests

```bash
npm test
```

The `test` script uses Node's built-in test runner on these files:

```text
lib/auth.spec.mts
lib/auth/email.spec.mts
lib/applications.spec.mts
lib/navigation.spec.mts
lib/design-tokens.spec.mts
lib/db/migrations.spec.mts
lib/validators/applications.spec.mts
```

What they cover:

- login/signup validation rules
- verification email content and fallback behavior
- summary math, stale boundary, response rate
- 12-week trend buckets, boundaries, exclusions, empty input
- navigation records and unknown-path fallback
- palette values, token presence, contrast, dark scheme, and raw-hex isolation
- migration index definitions
- Zod schemas and future-date rejection

There is no DOM test runner installed. Component behavior is verified manually
(keyboard, zoom, reduced motion, responsive widths). This is a documented
exception to the "spec every component" rule in `AGENTS.md`.

### Lint and build

```bash
npm run lint
npm run build
```

Run lint before submitting any change. Run the build for changes that affect
routes, rendering, or production behavior.

### Documentation-first workflow

1. Write or refine requirements in `PRD.md`.
2. Break them into tasks in `TASKS.md`.
3. Follow `RULES.md` and `ARCHITECTURE.md`.
4. Apply `SYSTEM_DESIGN.md` for UI work.
5. Implement in small steps.
6. Run tests, lint, and build.
7. Record the change in `CHANGLOG.md`.

---

## 16. Glossary

| Term | Meaning |
| --- | --- |
| **App Router** | Next.js's file-based routing system under `app/` |
| **Atlas** | MongoDB's hosted cloud database service |
| **Better Auth** | The authentication library used for signup, login, and sessions |
| **BSON** | Binary JSON, MongoDB's storage format; adds `ObjectId` and `Date` |
| **Client Component** | React component that runs in the browser; starts with `"use client"` |
| **Collection** | MongoDB's equivalent of a table |
| **Cookie** | Small browser-stored value sent with requests; here it holds the session token |
| **Document** | One record in MongoDB; here, one user or one application |
| **Driver** | Library that talks to a database; here the native `mongodb` package |
| **Hydration** | React attaching event handlers to server-rendered HTML |
| **Index** | A lookup structure that speeds up queries |
| **Layout** | A shared wrapper around pages in a route segment |
| **Migration** | A versioned, repeatable database change |
| **ObjectId** | MongoDB's 12-byte identifier type |
| **ORM** | Object-Relational Mapper; not used here |
| **Page** | The component that renders a URL |
| **Repository** | Data-access layer that owns all queries for a collection |
| **Route group** | A `(folder)` that organizes routes without changing the URL |
| **Route handler** | A server function exported from `route.ts` for an HTTP method |
| **RSC** | React Server Component |
| **Serialization** | Converting BSON/driver types into JSON-safe strings |
| **Session** | Server-side record proving a browser is signed in |
| **SSR** | Server-Side Rendering |
| **TTL index** | An index that lets MongoDB delete documents after a date |
| **Zod** | TypeScript-first schema validation library |

---

## 17. Known gaps between docs and code

This section is here so a beginner does not get confused when two files seem to
disagree. When in doubt, the code is the current truth and `PRD.md` describes the
target.

1. **The README still calls authentication a mock prototype.** The code now uses
   real Better Auth accounts, MongoDB sessions, and email verification. The
   README's "Current status" and "Current Authentication Prototype" sections are
   stale.

2. **`components/auth/AuthRoute.tsx` is now a pass-through.** It returns its
   children and does nothing else. The real guard lives in
   `app/(workspace)/layout.tsx`. The component is kept for compatibility but is
   not used by the workspace layout anymore.

3. **There is no `proxy.ts` / middleware.** Redirects happen in server layouts and
   pages, not at the edge before routing.

4. **Signed-in users visiting `/login` or `/signup` are redirected in the
   browser.** The page first renders a "Loading JobFlow…" state, calls
   `authClient.getSession()`, then calls `router.replace("/dashboard")`. There is
   no server-side redirect for those two pages.

5. **The tracker UI does not exist yet.** The API supports create, list, update,
   and delete, but there is no screen for adding or editing an application. The
   dashboard reads real per-user data and shows an empty state for new accounts.

6. **There is no `GET /api/applications/:id`.** The collection route supports
   `PATCH` and `DELETE`. The list route returns all of the signed-in user's
   applications.

7. **The repository receives `userId` from the caller.** `PRD-004` says the
   repository should derive it from the session. In the code, route handlers and
   pages call `getSession()` and pass `session.user.id`; the repository then
   includes that value in every filter. Isolation still holds because the ID
   always comes from the server-side session, never from request input—but the
   derivation happens one layer up.

8. **`lib/applications.ts` still contains sample data and `getApplications()`.**
   The dashboard no longer uses it; it reads MongoDB. The sample helper remains
   useful for the pure summary/trend tests.

9. **Rate limiting is not visible in the current auth config.** `PRD-004` calls
   for Better Auth's in-memory limiter, but `lib/auth/config.ts` does not set a
   `rateLimit` option. Treat the requirement as pending.

10. **`ARCHITECTURE.md` contains a typo (`architecture.nd`).** The actual file is
    `ARCHITECTURE.md`.

If you change the architecture, update `ARCHITECTURE.md`; if you change setup or
environment variables, update `README.md` and `.env.example`; and if you change
behavior, add a dated entry to `CHANGLOG.md`.

---

## Where to go next

- Read `PRD.md` to see what the product is supposed to do.
- Read `TASKS.md` to see what is done and what is next.
- Read `ARCHITECTURE.md` before adding files or layers.
- Read `SYSTEM_DESIGN.md` before building UI.
- Read `RULES.md` before opening a pull request.
- Open `app/page.tsx` and follow the redirects. Then open
  `app/(workspace)/dashboard/page.tsx` and trace one database call down to
  `lib/repositories/applications.ts`. That path touches every important concept
  in this guide.
