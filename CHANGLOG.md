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
