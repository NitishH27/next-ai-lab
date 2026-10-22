# Development Rules

Follow these rules when changing this application:

## Agent Workflow

- For every new change or update, Codex must use the ponytail skill at `C:\Users\Nitish\.agents\skills\ponytail\SKILL.md` and follow its current instructions.
- For feature work, use `PRD.md` for requirements and `TASKS.md` for the implementation backlog. Decompose ready requirements into linked tasks before implementation, and keep task and requirement statuses current.
- When the `grill-me` skill is used to review a requirement, plan, or design, make sure the linked task exists under **To Do** in `TASKS.md` before the interview starts. Never run a grilling without a task recording it.
- When the grilling resolves the requirement's open questions, move that task to **Ready for Code**. It is unblocked and specified, but no code has been written yet.
- When implementation starts on a ready task, move it to **In Progress**.
- When the implementation is complete and the quality checks in this file pass, move the task to **Done**.
- If a grilling produces several implementation tasks, update every affected task's status in the same pass so `TASKS.md` never lags behind the work.

## Framework and Structure

- Before changing app code or creating a component, read `ARCHITECTURE.md` and follow its structure and conventions. Update it when a lasting architectural change is made.
- Before implementing a new component or modifying an existing component, always check `SYSTEM_DESIGN.md` and follow its visual and interaction standards to keep the UI consistent. Update the design guide when intentionally changing a shared standard.
- For every new or changed component, use the `better-ui` skill and apply its exact values for alignment, geometry, radius, spacing, shadows, icon stroke, and motion. Polish never overrides a broken interaction.
- For every icon in the app, use the `suggest-lucide-icons` skill to confirm a real Lucide icon name before adding it. Never invent an icon name or mix icon libraries on one surface; `lucide-react` is the app’s icon source.
- Use the installed Next.js 16 App Router conventions. Before changing app code, consult the relevant guide in `node_modules/next/dist/docs/`.
- Put routes and layouts in `app/`; keep shared global styles in `app/globals.css` and static files in `public/`.
- Prefer React Server Components. Add `"use client"` only when a component needs browser APIs, state, effects, or event handlers.
- Reuse the `@/*` path alias for imports from the repository root.

## TypeScript and Code Style

- Write new application code in TypeScript; keep strict typing and avoid `any` unless there is a clear, documented reason.
- Use two-space indentation, double quotes, and semicolons, matching the existing codebase.
- Name components and types in PascalCase; use camelCase for functions and variables.
- Keep components focused, accessible, and responsive. Use semantic HTML, provide labels for form controls, and include useful alternative text for meaningful images.
- Keep secrets and local environment files out of source control. Read configuration from environment variables and document required variable names without committing secret values.

## Quality Checks

- Run `npm run lint` before submitting changes.
- Run `npm run build` for changes that affect routes, rendering, or production behavior.
- When adding tests or a test framework, cover important behavior and document how to run the tests.
- Update relevant documentation when setup steps, configuration, or user-facing behavior changes.
