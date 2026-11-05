import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const globalsPath = fileURLToPath(new URL("../app/globals.css", import.meta.url));
const applicationsPath = fileURLToPath(
  new URL("../components/applications/applications-grid.css", import.meta.url),
);
const globalsCss = readFileSync(globalsPath, "utf8");
const applicationsCss = readFileSync(applicationsPath, "utf8");

const rootMatch = /:root\s*\{([\s\S]*?)\}/.exec(globalsCss);

assert.ok(rootMatch, "app/globals.css must contain a :root block");

const rootBlock = rootMatch[1];
const tokens = new Map<string, string>();

for (const match of rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  tokens.set(match[1], match[2].trim());
}

const expectedColors = new Map([
  ["--canvas", "#0b0f14"],
  ["--surface", "#11171e"],
  ["--surface-raised", "#18202a"],
  ["--surface-hover", "#1a222c"],
  ["--surface-sunken", "#0e141a"],
  ["--text", "#e6edf1"],
  ["--text-muted", "#9aa7b0"],
  ["--border", "#232d37"],
  ["--border-control", "#6b7a86"],
  ["--border-strong", "#8a9ba7"],
  ["--primary", "#a8dadc"],
  ["--primary-hover", "#bfe7e7"],
  ["--accent", "#7fd1cd"],
  ["--accent-text", "#9be0dc"],
  ["--focus", "#a8dadc"],
  ["--success", "#7fc79a"],
  ["--warning", "#e3b36a"],
  ["--danger", "#e58c8c"],
  ["--info", "#8cb8e0"],
]);

const surfaces = [
  "--canvas",
  "--surface",
  "--surface-raised",
  "--surface-hover",
  "--surface-sunken",
];

const textColors = [
  "--text",
  "--text-muted",
  "--accent-text",
  "--accent",
  "--success",
  "--warning",
  "--danger",
  "--info",
];

const requiredTokens = [
  "--font-sans",
  "--text-caption",
  "--text-meta",
  "--text-ui",
  "--text-body",
  "--text-title",
  "--text-heading",
  "--text-display",
  "--radius-control",
  "--radius-card",
  "--radius-overlay",
  "--radius-pill",
  "--shadow-overlay",
  "--motion-fast",
  "--motion-overlay",
  "--navbar-height",
  "--control-height",
  "--search-height",
  "--grid-header-height",
  "--row-height",
  "--content-max",
  "--chart-height",
  "--auth-width",
  "--drawer-width",
];

function hexToRgb(hex: string) {
  const normalized = hex.trim().toLowerCase();
  assert.match(normalized, /^#[0-9a-f]{6}$/, `${hex} must be a six-digit hex color`);

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function channelLuminance(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrast(foreground: string, background: string) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function token(name: string) {
  const value = tokens.get(name);
  assert.ok(value, `${name} must be defined in :root`);
  return value;
}

test("dark scheme is set and the retired surface-accent token is absent", () => {
  assert.match(rootBlock, /color-scheme\s*:\s*dark\s*;/);
  assert.equal(tokens.has("--surface-accent"), false);
  assert.doesNotMatch(globalsCss, /--surface-accent\s*:/);
});

test("every required design token exists", () => {
  for (const name of requiredTokens) {
    assert.ok(token(name), `${name} must be defined in :root`);
  }
});

test("the palette uses the locked dark Ink Navy values", () => {
  for (const [name, expected] of expectedColors) {
    assert.equal(token(name).toLowerCase(), expected, `${name} must be ${expected}`);
  }
});

test("the font stack starts with the Next.js Plus Jakarta Sans variable", () => {
  const fontStack = token("--font-sans");

  assert.match(fontStack, /^var\(--font-plus-jakarta\)/);
  assert.match(fontStack, /ui-sans-serif/);
  assert.match(fontStack, /system-ui/);
});

test("text and semantic colors meet WCAG AA on every surface", () => {
  for (const foreground of textColors) {
    for (const background of surfaces) {
      const ratio = contrast(token(foreground), token(background));
      assert.ok(
        ratio >= 4.5,
        `${foreground} on ${background} must be at least 4.5:1 (received ${ratio.toFixed(2)}:1)`,
      );
    }
  }
});

test("control boundaries and the focus ring meet 3:1", () => {
  for (const boundary of ["--border-control", "--border-strong"]) {
    for (const background of surfaces) {
      const ratio = contrast(token(boundary), token(background));
      assert.ok(
        ratio >= 3,
        `${boundary} on ${background} must be at least 3:1 (received ${ratio.toFixed(2)}:1)`,
      );
    }
  }

  for (const background of ["--canvas", "--surface", ...surfaces.slice(2)]) {
    const ratio = contrast(token("--focus"), token(background));
    assert.ok(
      ratio >= 3,
      `--focus on ${background} must be at least 3:1 (received ${ratio.toFixed(2)}:1)`,
    );
  }
});

test("primary actions keep canvas text at AA contrast", () => {
  for (const background of ["--primary", "--primary-hover"]) {
    const ratio = contrast(token("--canvas"), token(background));
    assert.ok(
      ratio >= 4.5,
      `--canvas on ${background} must be at least 4.5:1 (received ${ratio.toFixed(2)}:1)`,
    );
  }
});

test("no raw hex colors appear outside the :root token block", () => {
  const globalsWithoutRoot = globalsCss.replace(rootMatch[0], "");

  assert.doesNotMatch(globalsWithoutRoot, /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(applicationsCss, /#[0-9a-f]{3,8}\b/i);
});
