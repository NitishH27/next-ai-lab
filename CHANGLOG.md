# Change Log

This file records repository changes made by Codex, with a dated title and a brief summary for each prompt that changes the project.

## 2026-10-16 — Add Repository Contributor Guide

- Added `AGENTS.md` with project structure, development commands, coding conventions, validation guidance, and pull request expectations.

## 2026-10-16 — Add Application Development Rules

- Added `RULES.md` with guidance for Next.js usage, TypeScript style, accessibility, configuration safety, and quality checks.

## 2026-10-16 — Document Application Architecture

- Added `architecture.nd` with the current repository structure and guidance for organizing future app code.

## 2026-10-16 — Require Architecture Review Before App Changes

- Updated `RULES.md` to require reading `architecture.md` before changing app code or creating components, and to update it for lasting architectural changes.

## 2026-10-16 — Require Ponytail Skill for Codex Changes

- Updated `RULES.md` to require Codex to use the ponytail skill for each new change or update.

## 2026-10-16 — Add App Task Backlog

- Added `TASKS.md` as the app implementation backlog, with sections for tasks to do, in progress, and done.

## 2026-10-16 — Add Product Requirements Workflow

- Added `PRD.md` with a requirements template and delivery process from product requirements to implementation tasks and completion.
- Linked `PRD.md` and `TASKS.md` in `RULES.md`, and required tasks to reference their PRD requirement IDs.

## 2026-10-16 — Uppercase Markdown Filenames

- Renamed `architecture.md` to `ARCHITECTURE.md` and `changlog.md` to `CHANGLOG.md`.
- Updated references so documentation links use the uppercase filenames.

## 2026-10-16 — Define Shared UI System

- Added `SYSTEM_DESIGN.md` with proposed color tokens, typography, spacing, layout, component, and accessibility standards.
- Updated `RULES.md` and `ARCHITECTURE.md` to make the design guide part of the component workflow and repository map.

## 2026-10-16 — Require Design System Review for Components

- Clarified in `RULES.md` that Codex must check `SYSTEM_DESIGN.md` before implementing or updating any component to keep the UI consistent.

## 2026-10-16 — Apply Ocean Depths Theme

- Updated `SYSTEM_DESIGN.md` with Ocean Depths color tokens and typography, while retaining the app's existing Geist font as a fallback.

## 2026-10-16 — Specify Authentication Screens and Dashboard

- Added proposed requirement `PRD-001` for login, signup, disabled Google login, dashboard entry, and reduced-motion-aware Lottie animations.
- Added five linked planning tasks to `TASKS.md`; authentication-dependent work is gated on the requirement's open decisions.

## 2026-10-16 — Finalize PRD-001 Prototype Decisions

- Updated `PRD-001` with email-based mock login, validation, signup fields, tab-scoped session behavior, route guards, responsive panel placement, and custom Lottie concepts.
- Marked `PRD-001` ready and moved the completed decision task to **Done** in `TASKS.md`.

## 2026-10-17 — Implement PRD-001 Authentication Prototype

- Added responsive login, signup, and dashboard routes with Ocean Depths styling, form validation, password visibility controls, and a disabled Google sign-in option.
- Added session-scoped mock authentication and client route guards; passwords are never stored.
- Added two custom local Lottie animations with reduced-motion fallbacks, a validation spec, and an offline-safe system font setup.

## 2026-10-22 — Specify Dashboard Status Widgets

- Added proposed requirement `PRD-002` for four dashboard widgets: applications sent, positive responses, rejected, and awaiting review.
- Documented the shared application status model, count helper, mock-data approach, responsive layout, accessibility rules, and open questions about real data source and status definitions.

## 2026-10-22 — Sharpen PRD-002 After Design Review

- Reworked `PRD-002` to five widgets after a design interview: added Offers and split positive responses from offers so no application is double-counted.
- Adopted a six-status model with withdrawn records counted only in Applications sent, and a resolved-response rate that excludes awaiting and withdrawn applications.
- Defined awaiting review as employer silence with a 14-day follow-up flag, kept hardcoded full sample records with dates relative to today, and required a visible sample-data notice.
- Replaced the tautological totals test with explicit invariant, rate, and stale-boundary cases, and recorded the deferred component-spec exception.
- Marked `PRD-002` ready and added four linked tasks to `TASKS.md`.

## 2026-10-22 — Require Task Tracking Through Grilling

- Added `grill-me` workflow rules to `RULES.md`: the linked task starts in **To Do**, moves to **In Progress** when the grilling resolves its open questions, and moves to **Done** after implementation and quality checks.
- Moved the `PRD-002` implementation tasks to **In Progress**, since their grilling is resolved.

## 2026-10-22 — Add Ready for Code Task Stage

- Split the post-grilling stage in `RULES.md`: resolved grilling moves a task to **Ready for Code**, starting implementation moves it to **In Progress**, and finished work with passing checks moves to **Done**.
- Added the **Ready for Code** section to `TASKS.md` and moved the `PRD-002` tasks there.

## 2026-10-22 — Add Widget Icons and Sent Breakdown

- Extended `PRD-002` with decorative top-right icons per card, chosen from the UI guidance icon set and rendered as inline SVG so no icon dependency is added.
- Made Applications sent show all six status counts plus its total, with the card spanning the grid on wide screens.
- Updated the linked `PRD-002.2` and `PRD-002.4` tasks to include the icons, breakdown, and keyboard/screen-reader validation.

## 2026-10-22 — Require Lucide Icons and better-ui Polish

- Added rules to `RULES.md`: confirm every icon with the `suggest-lucide-icons` skill and use `lucide-react` as the single icon source; apply the `better-ui` skill to every new or changed component.
- Moved the `PRD-002` card icons to the top-left, replaced the provisional set with verified Lucide names (`send`, `message-circle-check`, `award`, `circle-x`, `clock`), and specified 20px sizing, 2px absolute stroke, 8px gap, token colors, RTL mirroring for `send`, and no icon animation.
- Updated the linked dashboard tasks for the icon library and alignment validation.

## 2026-10-22 — Fit Five KPI Cards in the Top Half

- Relaxed the `PRD-002` icon rule: no mandated corner, the icon leads the card header beside the label per the UI guidance, with `better-ui` optical alignment.
- Changed the layout to one row of five compact KPI cards at 1024px and wider, sized so the heading, notice, and widgets end inside the top 50% of a 1280×800 viewport, following the Executive Dashboard KPI guidance.
- Replaced the full-width Applications sent card with a compact two-column six-status breakdown and a 240px card height budget at 1280×800.
- Updated the linked layout, icon, and validation tasks.
