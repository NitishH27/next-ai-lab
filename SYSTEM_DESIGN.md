# System Design

This document defines the visual and interaction standards for new UI and components. The visual direction follows the selected **Ocean Depths** theme. Apply these rules consistently; update this file when the product adopts a different design direction. The app currently contains the default Next.js starter screen, so these are the target product standards rather than styles already implemented in the app.

## Visual Direction

Use a calm, clear, light-first interface for a job search and application workflow. Use deep navy for structure and emphasis, teal for interactive accents, seafoam for quiet highlights, and cream for the page canvas. Favor strong hierarchy, generous whitespace, and clear status feedback. Avoid decorative gradients, excessive shadows, and using color as the only way to communicate meaning.

## Color Tokens

Use semantic tokens rather than placing raw color values throughout components.

| Token | Light value | Use |
| --- | --- | --- |
| `canvas` | `#F1FAEE` | Cream page background |
| `surface` | `#FFFFFF` | Cards, menus, dialogs, and form fields |
| `surface-accent` | `#A8DADC` | Quiet highlights and selected backgrounds |
| `text` | `#1A2332` | Deep navy main text and headings |
| `text-muted` | `#43515E` | Secondary text and descriptions |
| `border` | `#D7E4E2` | Dividers and control borders |
| `primary` | `#1A2332` | Main actions and selected states |
| `primary-hover` | `#243246` | Hover and pressed primary action |
| `accent` | `#2D8B8B` | Teal icons, indicators, and decorative emphasis |
| `accent-text` | `#1F6666` | Teal links and text requiring readable contrast |
| `focus` | `#2D8B8B` | Visible keyboard focus ring |
| `success` | `#15803D` | Successful actions and completed states |
| `warning` | `#B45309` | Attention and upcoming states |
| `danger` | `#B91C1C` | Errors and destructive actions |
| `info` | `#0369A1` | Informational states |

The Ocean Depths palette uses Deep Navy `#1A2332`, Teal `#2D8B8B`, Seafoam `#A8DADC`, and Cream `#F1FAEE`. The darker teal text token is a contrast-conscious variant for small text; use the theme teal for accents and non-text emphasis. Pair status colors with text or an icon and a clear label. Check actual foreground/background combinations; normal text must meet WCAG AA (4.5:1).

For dark surfaces, use Deep Navy `#1A2332` for the canvas, a slightly lighter navy such as `#243246` for raised surfaces, Cream `#F1FAEE` for main text, and Seafoam `#A8DADC` for secondary emphasis. Use Seafoam with Deep Navy text for primary actions. Validate contrast for every pairing; do not invert the light palette mechanically.

## Typography

- Use DejaVu Sans for headings and body text, as specified by Ocean Depths, with Arial as the system fallback (`"DejaVu Sans", Arial, sans-serif`). Use a monospaced system font for code, IDs, and tabular values only where monospaced alignment helps.
- Use a 16px (1rem) body size with a 1.5 line height. Do not use text below 12px for essential content.
- Use this type scale: 12px small labels, 14px secondary UI, 16px body, 18px emphasized body, 20px section title, 24px page section heading, 30px page title, 36px large display heading.
- Keep headings concise and use weight and size consistently: 400 regular, 500 medium, 600 semibold, 700 bold. Avoid using bold for long passages.

## Spacing, Layout, and Shape

- Use a 4px spacing base. Preferred steps are 4, 8, 12, 16, 24, 32, 48, and 64px. Use 16px inside compact controls, 16–24px inside cards, and 24–32px between major sections.
- Build mobile-first layouts. Let content fill narrow screens; constrain desktop reading and work areas to about 1200px and center them when appropriate. Avoid fixed-width page layouts and horizontal overflow.
- Use 8px corner radius for inputs and buttons, 12px for cards, and 16px for dialogs or larger surfaces. Prefer a 1px border and subtle shadow only when elevation clarifies hierarchy.
- Keep touch targets at least 44×44px where practical, with at least 8px between separate targets.

## Component Standards

- **Buttons:** Provide primary, secondary, and destructive variants. Use sentence-case labels, clear disabled states, and visible hover, pressed, and focus states. Show progress for actions that take time and prevent accidental repeat submission.
- **Forms:** Always show persistent labels; use placeholders only for examples. Place concise help and validation messages beside the relevant field. Preserve entered values when validation fails.
- **Cards and panels:** Use a clear title, optional description, and one main action. Keep related information grouped and avoid nesting cards without a clear reason.
- **Navigation:** Make the current location obvious and provide meaningful link text. Keep navigation structure consistent across routes.
- **Statuses and badges:** Use short text labels such as “Applied” or “Interview”; pair color with text and never use color alone.
- **Dialogs and menus:** Support keyboard operation, move focus into an opened dialog, keep focus contained while it is open, and return focus to its trigger when closed.
- **Feedback states:** Design loading, empty, success, and error states for data-driven components. Explain what happened and provide a useful next step where possible.

## Accessibility and Motion

- Use semantic HTML, logical heading order, accessible names for controls, and useful alternative text for meaningful images.
- Ensure all interactive elements work by keyboard and show a visible focus indicator. Do not remove the browser outline without an accessible replacement.
- Keep animation brief and purposeful. Respect `prefers-reduced-motion`; do not rely on motion to convey information.

## Applying This System

Before creating or changing a UI component, read `RULES.md` and `ARCHITECTURE.md`, then apply these tokens and component standards. Put reusable UI in the shared component location established by `ARCHITECTURE.md`; do not create a new component layer for a one-off element without need. When an existing component establishes a consistent pattern, follow it or update this guide if the standard is intentionally changing.
