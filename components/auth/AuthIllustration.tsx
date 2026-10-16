"use client";

import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";
import loginAnimation from "@/public/animations/login-workspace.json";
import signupAnimation from "@/public/animations/signup-progress.json";

type AuthIllustrationProps = {
  variant: "login" | "signup";
};

export default function AuthIllustration({ variant }: AuthIllustrationProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  if (reduceMotion) {
    return (
      <div className={`auth-illustration-static auth-illustration-static-${variant}`} aria-hidden="true">
        <span className="auth-illustration-orb" />
        <span className="auth-illustration-card auth-illustration-card-one" />
        <span className="auth-illustration-card auth-illustration-card-two" />
        <span className="auth-illustration-card auth-illustration-card-three" />
      </div>
    );
  }

  return (
    <Lottie
      src={variant === "login" ? loginAnimation : signupAnimation}
      aria-hidden="true"
      className="auth-illustration"
      autoplay
      loop
    />
  );
}
