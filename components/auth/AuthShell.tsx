import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  variant: "login" | "signup";
};

export default function AuthShell({ children, variant }: AuthShellProps) {
  const isLogin = variant === "login";

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="auth-wordmark" href="/" aria-label="JobFlow home">
          <span className="auth-wordmark-dot" aria-hidden="true" />
          JobFlow
        </Link>
        <div className="auth-form-heading">
          <h1>{isLogin ? "Sign in to JobFlow" : "Create your JobFlow account"}</h1>
          <p>
            {isLogin
              ? "Pick up where you left off and keep every opportunity moving."
              : "Track applications and next steps in one calm workspace."}
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
