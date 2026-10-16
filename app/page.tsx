"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isMockAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isMockAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return <main className="route-loading" aria-live="polite">Loading JobFlow…</main>;
}
