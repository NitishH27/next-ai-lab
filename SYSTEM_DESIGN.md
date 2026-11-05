# System Design

This document is the visual and interaction source of truth for JobFlow. The target is a dark, minimal workspace for job seekers: one ink-navy canvas, one cool-grey text family, one seafoam action color, and one teal interaction accent. Structure comes from alignment, whitespace, and 1px hairlines, not from nested cards, fills, gradients, glows, or decorative shadows.

The direction adapts the `ui-ux-pro-max` dark dashboard and minimal SaaS guidance and applies the `ui-taste` anti-slop rules. `ui-ux-pro-max` selected **Plus Jakarta Sans** for this enterprise SaaS and productivity dashboard. Material UI and Chakra UI are component libraries, not typefaces; they are not adopted because they would add a second component and theme system beside the existing token and CSS layer.

PRD-008 implements this system. Until that work lands, the existing light Ocean Depths UI remains the current implementation. Do not mix the two directions on one screen.

## Principles

- **One canvas.** The page, top navigation, and workspace frame share the `canvas` tone. Only content panels, controls, menus, and drawers use raised surfaces.
- **One accent for interaction.** Seafoam is the primary action color and teal is the interaction accent. Status hues are semantic signals, not extra accents.
- **One cool-grey family.** Use the ink-navy greys below. Do not introduce warm greys, cream, or a second neutral ramp.
- **Data first.** Counts, labels, and the next action lead. Remove decoration that does not clarify the task.
- **Hairlines, not boxes.** A 1px border and whitespace define a surface. Do not nest bordered cards or add a card shadow to separate content.
- **Shape lock.** Use 8px for controls, 12px for cards and panels, and 16px for overlays. Pills are only for counts, tags, and avatars.
- **Lucide only.** Use one confirmed icon family. No emoji, hand-drawn SVGs, or a second icon set.
- **Complete states.** Every data surface has loading, empty, error, and success states. A visual reduction must never remove a recovery path.
- **Motion explains state.** Animate color, opacity, transform, and the navigation indicator. Do not add entrance animations to cards, stats, or charts.
- **Dark only.** There is no light mode or theme switcher in this system.

## Color Tokens

Use semantic tokens rather than raw color values in components.

| Token | Dark value | Use |
| --- | --- | --- |
| `canvas` | `#0B0F14` | Page, top navigation, and workspace frame |
| `surface` | `#11171E` | Cards, panels, form fields, grid background |
| `surface-raised` | `#18202A` | Menus, drawers, tooltips, account panel |
| `surface-hover` | `#1A222C` | Neutral hover wash for rows, links, and quiet controls |
| `surface-sunken` | `#0E141A` | Table headers, avatar backgrounds, quiet bands |
| `text` | `#E6EDF1` | Main text, headings, and values |
| `text-muted` | `#9AA7B0` | Secondary text, labels, descriptions, icons |
| `border` | `#232D37` | Hairlines and structural dividers |
| `border-control` | `#6B7A86` | Resting boundary for inputs and outlined controls |
| `border-strong` | `#8A9BA7` | Hovered control boundary and emphasized divider |
| `primary` | `#A8DADC` | Primary action fill and focus ring |
| `primary-hover` | `#BFE7E7` | Primary action hover |
| `accent` | `#7FD1CD` | Active navigation rule, wordmark dot, applied chart series |
| `accent-text` | `#9BE0DC` | Links and small accent text |
| `focus` | `#A8DADC` | Keyboard focus ring |
| `success` | `#7FC79A` | Success, offer, and completed states |
| `warning` | `#E3B36A` | Attention, interview, and stale follow-up |
| `danger` | `#E58C8C` | Errors, rejection, and destructive actions |
| `info` | `#8CB8E0` | Screening and informational states |

`surface-accent` is retired. Do not reintroduce it. Use `surface-hover`, `accent`, or `border` for the role it used to play.

Primary actions use `primary` as the background and `canvas` as the text. Do not use raw white on seafoam. Links use `accent-text`, not `accent`, so small text keeps a comfortable contrast margin.

### Contrast

The design-token spec checks every foreground against `canvas`, `surface`, `surface-raised`, `surface-hover`, and `surface-sunken`. The lowest measured ratios are:

| Pair | Minimum ratio | Requirement |
| --- | --- | --- |
| `text` on any surface | 13.56:1 | ≥ 4.5:1 |
| `text-muted` on any surface | 6.51:1 | ≥ 4.5:1 |
| `accent-text` on any surface | 10.76:1 | ≥ 4.5:1 |
| `accent` on any surface | 9.09:1 | ≥ 4.5:1 |
| `success` on any surface | 8.05:1 | ≥ 4.5:1 |
| `warning` on any surface | 8.34:1 | ≥ 4.5:1 |
| `danger` on any surface | 6.46:1 | ≥ 4.5:1 |
| `info` on any surface | 7.68:1 | ≥ 4.5:1 |
| `border-control` on any surface | 3.63:1 | ≥ 3:1 |
| `border-strong` on any surface | 5.60:1 | ≥ 3:1 |
| `canvas` on `primary` | 12.56:1 | ≥ 4.5:1 |
| `canvas` on `primary-hover` | 14.46:1 | ≥ 4.5:1 |
| `focus` on canvas or surface | 11.78:1 | ≥ 3:1 |

`border` is a hairline at roughly 1.2–1.4:1. It is intentionally quiet and is not a control boundary. Inputs, outlined buttons, and other interactive boundaries use `border-control` at rest and `border-strong` on hover.

### Status Colors

Use status color as supporting emphasis, never as the only signal. The label carries the meaning.

| Status | Dot / emphasis | Label |
| --- | --- | --- |
| Applied | `accent` | `text` |
| Screening | `info` | `text` |
| Interview | `warning` | `text` |
| Offer | `success` | `text` |
| Rejected | `danger` | `text` |
| Withdrawn | `text-muted` | `text-muted` |

The dashboard's six-status line is text-only and uses no dots. The applications grid uses a 6px dot plus the text label. Do not use filled status pills, colored row backgrounds, or color-only status cues.

## Typography

- Use **Plus Jakarta Sans** as the only family. Load it through `next/font/google` with the `latin` subset, weights 400, 500, and 600, `display: "swap"`, and the variable `--font-plus-jakarta`.
- Set `--font-sans` in `:root` to `var(--font-plus-jakarta), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. The system stack is the fallback, not a second design choice.
- Do not add italic, weights below 400, or weights above 600. Do not add a display family.
- Use sentence case everywhere. Do not use uppercase eyebrows, kickers, or labels.
- Use tabular numerals for counts, dates, rates, and anything that aligns in a column.
- Use `-0.01em` tracking on headings 20px and larger and `-0.02em` on the 32px value style. Keep tracking at zero below 20px.
- Keep form inputs at 16px to avoid mobile browser zoom. Do not use essential text below 12px.

| Token | Size | Line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `--text-caption` | 12px | 1.4 | 500 | Grid headers, chart legend, status labels, small metadata |
| `--text-meta` | 13px | 1.45 | 400/500 | Descriptions, account name, drawer labels, dates |
| `--text-ui` | 14px | 1.45 | 400/500 | Navigation, buttons, grid cells, supporting UI |
| `--text-body` | 16px | 1.5 | 400 | Body copy, form inputs, auth supporting text |
| `--text-title` | 20px | 1.3 | 600 | Page titles, drawer titles |
| `--text-heading` | 24px | 1.25 | 600 | Auth headings |
| `--text-display` | 32px | 1.1 | 600 | Dashboard summary values |

Define these as `:root` tokens (`--text-caption` through `--text-display`) so components do not hard-code sizes. Set `colorScheme: "dark"` and `themeColor: "#0B0F14"` in the root viewport metadata so the browser chrome matches the canvas during load and on mobile.

The wordmark is 16px/600 with a 6px `accent` dot. There is no image tile and no collapsed monogram; the top navigation keeps the text wordmark at every width.

## Spacing, Sizing, and Shape

Use a 4px spacing base. Preferred steps are 4, 8, 12, 16, 20, 24, 32, 48, and 64px. Use 8–12px inside compact controls, 16–24px inside cards, 20–24px inside dashboard panels, and 24–32px between major sections.

| Element | Value |
| --- | --- |
| Content max width | `72rem` |
| Page inline padding | `clamp(1rem, 2.5vw, 2rem)` |
| Page block padding | `clamp(1.5rem, 3vw, 2.5rem)` |
| Major section gap | `24px` |
| Card / panel padding | `20px` |
| Control height | `44px` |
| Applications search height | `40px` (documented exception, no other control) |
| Grid header height | `44px` |
| Grid row height | `48px` |
| Grid cell inline padding | `20px` |
| Dashboard chart height | `clamp(15rem, 34svh, 20rem)` |
| Auth column | `min(100%, 24rem)` |
| Auth heading-to-form gap | `24px` |
| Drawer width | `min(28rem, 100vw)` |
| Drawer padding | `24px` |
| Drawer form gap | `20px` |
| Top navigation height | `64px` minimum |
| Navigation link height | `64px` (full bar) |
| Navigation link inline padding | `12px` |
| Account trigger | `44px` |
| Account avatar | `28px` |
| Account panel | `min(18rem, calc(100vw - 2rem))` |
| Mobile menu panel | inset-inline `8px`, top `100%`, padding `12px` |
| Status dot | `6px` |
| Chart line | `1.5px` |
| Chart active dot | `4px` |
| Focus ring | `2px` with `2px` offset |
| Press scale | `0.98` |

Shape tokens:

- `--radius-control: 8px` for inputs, buttons, search, nav hover, account trigger, and compact controls.
- `--radius-card: 12px` for cards, panels, the summary strip, the chart, and the grid panel.
- `--radius-overlay: 16px` for the account panel, mobile menu, drawer, and tooltips.
- `--radius-pill: 999px` for counts, tags, and avatars only. Do not turn rectangular controls into pills.

Use `--shadow-overlay: 0 20px 48px rgb(0 0 0 / 48%), 0 2px 8px rgb(0 0 0 / 32%)` only on overlays. Cards and panels use a 1px border and no shadow. Do not use gradients, glows, inner shadows, glass, or decorative background patterns.

## Icons

- Use `lucide-react` as the only icon source. Confirm every icon name with `suggest-lucide-icons` before adding it.
- Render navigation icons at 18px, button and account icons at 16px, inline metadata at 14px, and empty-state icons at 20px.
- Use `strokeWidth={1.75}` with `absoluteStrokeWidth` so the stroke stays consistent across sizes.
- Icons inherit `currentColor`. Do not fill icons with status colors or use them as the only status signal.
- Decorative icons are `aria-hidden="true"`. Icon-only buttons need a visible tooltip where practical and an accessible name.
- Use `layout-dashboard`, `briefcase`, and `circle-user-round` (when `/profile` exists) for navigation; `chevron-down` for the account trigger; `menu` and `x` for the mobile menu; `plus`, `search`, `x`, `log-out`, `badge-check`, `briefcase`, and `eye`/`eye-off` where their meaning applies.
- Do not mirror navigation icons. Use logical inline properties for RTL. The account chevron rotates vertically, not horizontally.

## Components

### Buttons and controls

- Primary: `primary` background, `canvas` text, 44px height, 8px radius, 14px/500 label, 16px icon. Hover `primary-hover`; pressed `0.98`; disabled opacity `0.56` with `not-allowed`.
- Secondary: transparent background, 1px `border-control`, `text` label. Hover `surface-hover` and `border-strong`.
- Ghost: transparent background and border, `text-muted` label. Hover `surface-hover` and `text`.
- Destructive: use `danger` text and border for reversible actions; use a filled `danger` button only for a confirmed destructive action with `canvas` text.
- Every control has a visible `:focus-visible` ring. Do not remove focus without an accessible replacement. Keep hover styles behind `@media (hover: hover)`.
- Use sentence-case labels and one obvious primary action per view.

### Forms

- Always show persistent labels. Placeholders are examples only.
- Inputs are 44px tall, 8px radius, `surface` background, 1px `border-control`, 16px text, and `text-muted` placeholders. Focus uses the 2px `focus` ring with a 2px offset.
- Errors use `danger` text, `aria-invalid`, and `aria-describedby`. Keep entered values on failure and move focus to the first invalid field.
- Drawer fields use the same 44px height. The only 40px field in the product is the applications search input.

### Panels and cards

- Cards and panels use `surface`, a 1px `border`, a 12px radius, and 20px padding. They have no shadow.
- Do not nest a bordered card inside another bordered card without a clear hierarchy reason. Prefer spacing and alignment.
- Use one title per panel. Do not add decorative icons, eyebrows, or hover affordances to static panels.

### Top navigation

Primary navigation lives in a sticky top navigation bar. There is no sidebar, collapse control, or flyout.

- The bar is `position: sticky; top: 0`, at least 64px tall, with a `canvas` background and a 1px `border` on the block-end edge. Its inner row is `min(100%, 72rem)`, centered, with `clamp(1rem, 2.5vw, 2rem)` inline padding.
- Left: the text wordmark `JobFlow` at 16px/600 with a 6px `accent` dot, linking to `/dashboard` with the accessible name `JobFlow dashboard`. No image tile.
- Center or left of the account: horizontal navigation links from `lib/navigation.ts`. Links are 64px tall, 14px/500, `text-muted`, with an 18px icon and an 8px gap, 12px inline padding. Map `/dashboard` to `LayoutDashboard`, `/applications` to `Briefcase`, and `/profile` to `CircleUserRound`; never fall back to `LayoutDashboard` for Applications. When `/profile` exists it appears in both the primary navigation and the account panel. The current link is `text` with `aria-current="page"` and a 2px `accent` underline at the block-end edge. There is no filled pill and no background wash.
- Inactive links show a 1px `border-strong` underline on hover and keyboard focus. The underline grows from the center with `transform: scaleX(0)` to `scaleX(1)` over 180ms. The active underline scales in over 180ms and stays visible. The underline is decorative; the label and `aria-current` carry the meaning.
- Right: the account trigger. It is 44px tall, borderless at rest, with a 28px `surface-sunken` avatar, the name at 13px/500, and a 16px `chevron-down`. It keeps a persistent accessible name such as `Account menu` even when the visual name is hidden. Hide the name below 64rem and keep the avatar and chevron. Hover or focus uses `surface-hover` with an 8px radius. The chevron rotates 180° over 150ms when the panel is open.
- The account panel uses `surface-raised`, a 1px `border`, a 16px radius, `--shadow-overlay`, and 16px padding. It opens with opacity and a 4px upward translate over 150ms. It contains the identity summary, verified state, and sign-out. It closes on outside press, Escape, or focus leave and returns focus to the trigger on Escape.
- Below 48rem, hide the horizontal links and show a 44px menu button with `menu` / `x` and the accessible name `Open menu` / `Close menu`. The account trigger becomes avatar-plus-chevron with no visual name but keeps its accessible name. The mobile menu is a panel below the bar with inset-inline 8px, `surface-raised`, a 1px `border`, a 16px radius, `--shadow-overlay`, 12px padding, `max-height: calc(100svh - 4rem - 16px)`, and `overflow-y: auto`. Links are 44px tall with the same icon/label treatment. The current item uses a 2px `accent` rule at the inline start instead of the bottom underline. The panel opens with opacity and a 4px upward translate over 150ms. It closes on link activation, outside press, or Escape, and returns focus to the menu button on Escape.
- The menu and account panels are mutually exclusive. The menu icon swaps instantly; the panel transition is the feedback. Do not cross-fade the icon.
- The navigation bar never hides, shrinks, or gains a scroll-triggered shadow. Only the active underline, hover/focus underlines, the account chevron, and the disclosure panels animate. Under `prefers-reduced-motion: reduce`, remove the underline scale, panel translate, and chevron rotation.
- The page header lives inside the content, not the bar: one `h1` at 20px/600, an optional 13px `text-muted` description, a 4px gap, and 24px bottom margin. The Applications description stays; the Dashboard description is removed because it repeats the title. The bar has the only structural hairline.
- The skip link is the first focusable element, targets `#workspace-content`, and sits above the bar. Set `scroll-padding-top` to account for the sticky bar. Focus order is skip link, wordmark, navigation links, account trigger, menu button, then page content.
- Layer order: skip link 100, drawer backdrop 50, drawer 60, navigation panels 40, navigation bar 30. Do not let the sticky bar sit above a modal backdrop.

### Dashboard summary and chart

- The summary is one `surface` strip with a 1px `border`, a 12px radius, no shadow, and five equal columns separated by 1px vertical hairlines. Each stat has a 12px/500 `text-muted` label, a 32px/600 tabular value, and a 12px `text-muted` detail. Use `All time` for Applications sent; `{rate}% of resolved` or `—` for Positive responses and Offers; `{rejected} of {resolved} resolved` for Rejected; and the stale follow-up line for Awaiting review. Remove per-card icons, tone classes, and card hover affordances.
- The five metrics are Applications sent, Positive responses, Offers, Rejected, and Awaiting review. The stale follow-up detail may use `warning` text when it is not zero.
- Use container queries to keep five columns at 56rem and wider, three below 56rem, two below 40rem, and one below 24rem. Use horizontal hairlines between rows and remove vertical rules that would dangle. Keep the count as the largest element.
- Below the strip, show a visible 12px/500 `text-muted` label `Applications sent by status` and a semantic `dl` with all six statuses. Use CSS separators that are `aria-hidden`; do not put the separator characters into the accessible text. The line is text-only. Keep the invariant `positive + offers + rejected + awaiting + withdrawn = sent` in the data.
- The dashboard empty state is plain 14px `text-muted` text on the canvas, not a bordered or dashed panel. Keep the strip at 0 with the rate `—` and include one live link, `Add your first application`, to `/applications`. Do not add a dead button.
- The chart is one `surface` panel with a 1px `border`, a 12px radius, no shadow, and 20px padding. The title is `Application activity` at 14px/600; the subtitle is `Last 12 weeks · N tracked` at 12px `text-muted`.
- Use Recharts as the only chart library. Plot three series: Applied solid `accent`, Rejected dashed `danger`, Interview dotted `warning`. Use 1.5px lines, a horizontal-only grid at low emphasis, no point dots at rest, and a 4px active dot. The legend swatches must mirror the line pattern, not just the color. Keep a visible legend and a visually hidden 12-row table.
- The tooltip uses `surface-raised`, a 1px `border`, a 12px radius, `--shadow-overlay`, and 12px text. Disable mount animation. The chart has no click behavior.
- When the window has no data, keep the panel height and show `No activity in the last 12 weeks.` without a dashed empty box.

### Applications grid and drawer

- The applications grid is one `surface` panel with a 1px `border`, a 12px radius, and no shadow. The toolbar sits above the panel with a 12px gap.
- The search field is the documented 40px exception: 1px `border-control`, 8px radius, `surface`, 14px text, and a 16px `text-muted` search icon. Hover uses `border-strong`. The Add application action is a 44px primary button with a 16px `plus` icon.
- The grid header is 44px with 12px/500 `text-muted` sentence-case labels. Rows are 48px with 14px text and 13px dates. Use 20px inline cell padding.
- Use horizontal row hairlines only. Remove vertical grid lines, zebra stripes, selection fills, and uppercase headers. Keep the full-row click target, the neutral `surface-hover` row wash, and the inset 2px `focus` ring. Keep a 14px `text-muted` chevron on the last cell, visible on row hover and keyboard focus; it is decorative, and the row keeps its accessible name.
- Status is a 6px dot plus a 12px/500 text label. Use the status mapping above. Do not use filled status pills or colored row backgrounds.
- The empty and loading states are plain, without a dashed border or circular icon chip. Use a single 20px `text-muted` icon, a 14px `text-muted` message, and the primary add action where appropriate. Keep skeleton rows aligned to the 48px row rhythm.
- The application drawer uses `surface-raised`, a 1px `border`, `--shadow-overlay`, a 16px radius on the inline edge, 24px padding, and a 16px radius only for the overlay surface. The title is 20px/600, labels are 13px/500, inputs are 44px, and the footer actions are 44px. Keep the existing focus trap, validation, keyboard behavior, and field layout.

### States and feedback

- Design loading, empty, error, and success states for every data surface. Explain what happened and provide a useful next step where one exists.
- Use `role="status"` for non-blocking success and `role="alert"` for errors. Do not claim a save succeeded before the server responds.
- Announce loading with text or a progress indicator; do not rely on a skeleton alone.
- Disable a submit control while its action is pending and prevent duplicate submission. Keep the entered values on failure.

## Motion

- Use `--motion-fast: 120ms` and `--motion-overlay: 150ms` with `cubic-bezier(0.2, 0, 0, 1)`.
- Animate only `background-color`, `color`, `border-color`, `opacity`, and `transform`. Never use `transition: all`.
- Navigation active and hover underlines: 180ms scale. Account chevron: 150ms rotate. Account and mobile panels: 150ms opacity plus 4px translate. Primary button and compact controls: 0.98 press scale over 120ms.
- Do not animate card mounts, KPI values, chart mounts, or page entrances. Do not animate height, width, or layout position. The top navigation does not hide or shrink on scroll.
- Under `prefers-reduced-motion: reduce`, remove the underline scale, panel translate, chevron rotation, press scale, and all non-essential transitions. Keep focus rings and state colors.

## Accessibility

- Meet WCAG AA contrast for all text and 3:1 for control boundaries and focus indicators.
- Use semantic HTML, one `h1` per page, logical heading order, persistent labels, and accessible names.
- Every interactive element works by keyboard and has a visible focus ring. Do not remove the browser outline without an accessible replacement.
- Keep at least 44×44px targets for standalone controls. The 40px search field is the one documented exception. Inline text links in prose are exempt from the 44px target rule.
- Use `aria-current="page"` for the current route, `aria-expanded` and `aria-controls` for disclosures, and `aria-hidden` for decorative icons and separators.
- Keep the chart's visually hidden table and the visible legend. Do not rely on color alone for series or statuses.
- Use logical inline properties for RTL. Keep `min-width: 0` on grid children and no horizontal page scroll at the 20rem test width. The layout must remain usable at 200% zoom.
- At 200% zoom, the navigation may wrap or switch to the mobile menu; it must not clip labels or remove the account panel.

## Applying This System

Before creating or changing a UI component, read `RULES.md` and `ARCHITECTURE.md`, then apply these tokens and component standards. Put reusable UI in the shared component location established by `ARCHITECTURE.md`; do not create a new component layer for a one-off element without need.

Use tokens in `app/globals.css` and component CSS; do not put raw hex values outside the `:root` token block. Keep AG Grid as the only grid library and Recharts as the only chart library. Do not add Material UI, Chakra UI, or another component or theme system.

For implementation verification, add the design-token spec described in PRD-008, check the contrast pairs, and perform the manual matrix at 1280×800, 1024×768, 768×1024, 375×812, and 320×568, at 200% zoom, with keyboard-only navigation, `prefers-reduced-motion: reduce`, and `dir="rtl"`. When an existing component establishes a consistent pattern, follow it or update this guide if the standard is intentionally changing.
