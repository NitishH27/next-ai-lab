"use client";

import { useEffect } from "react";

export default function ProfileError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="profile-error" role="alert">
      <h2>We couldn&apos;t load your profile</h2>
      <p>Something went wrong while reading your personal details. Try again.</p>
      <button type="button" className="button button-primary" onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
