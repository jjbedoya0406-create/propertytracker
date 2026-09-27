// Section 2's type scale as reusable class strings — not a wrapping
// component, since wrapping every heading/label app-wide would touch
// layout markup far beyond this ticket's "visuals only" scope. Color
// defaults to ink; pass "muted" for the secondary-text case.
export type TextRole =
  | "hero"
  | "title"
  | "value"
  | "section"
  | "body-strong"
  | "body"
  | "secondary"
  | "label";

const roleClass: Record<TextRole, string> = {
  hero: "text-hero font-semibold",
  title: "text-title font-semibold",
  value: "text-value font-semibold",
  section: "text-section font-semibold",
  "body-strong": "text-body-strong font-semibold",
  body: "text-body font-normal",
  // Tailwind class is text-caption, not text-secondary — see the comment
  // on --text-caption in src/index.css for why. "secondary" stays the
  // public role name here since that's the doc's own name for it.
  secondary: "text-caption font-normal",
  label: "text-label font-medium",
};

export function textClass(role: TextRole, color: "ink" | "muted" = "ink") {
  return `${roleClass[role]} ${color === "muted" ? "text-muted-foreground" : "text-ink"}`;
}
