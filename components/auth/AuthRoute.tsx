"use client";

import { type ReactNode } from "react";

type AuthRouteProps = {
  children: ReactNode;
  requireAuthentication?: boolean;
};

export default function AuthRoute({ children }: AuthRouteProps) {
  return <>{children}</>;
}
