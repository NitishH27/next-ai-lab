import type { ReactNode } from "react";
import AuthIllustration from "@/components/auth/AuthIllustration";

type AuthShellProps = {
  children: ReactNode;
  variant: "login" | "signup";
};

export default function AuthShell({ children, variant }: AuthShellProps) {
  const isLogin = variant === "login";

  return (
    <main className="auth-page">
      <aside className="auth-brand" aria-label="JobFlow introduction">
        <div className="auth-brand-copy">
          <span className="brand-mark">JobFlow</span>
          <p className="auth-brand-kicker">Your career, in motion</p>
          <h1>{isLogin ? "Pick up where your career left off." : "Your next chapter starts here."}</h1>
          <p className="auth-brand-description">
            {isLogin
              ? "Organize applications, stay prepared, and keep each opportunity moving."
              : "Build a calmer, clearer way to manage every application and opportunity."}
          </p>
        </div>
        <AuthIllustration variant={variant} />
      </aside>
      <section className="auth-form-panel">{children}</section>
    </main>
  );
}
