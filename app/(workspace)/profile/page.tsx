import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getProfile } from "@/lib/repositories/profiles";
import {
  getEmailVerificationState,
  toFormValues,
  toProfileView,
} from "@/lib/profile";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { PersonalDetailsForm } from "@/components/profile/PersonalDetailsForm";
import "@/components/profile/profile.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const stored = await getProfile(user.id);
  const profile = stored ? toProfileView(stored) : null;

  return (
    <div className="profile">
      <ProfileSummary
        name={user.name}
        email={user.email}
        emailVerified={getEmailVerificationState(user.emailVerified) === "verified"}
        createdAt={new Date(user.createdAt).toISOString()}
        headline={profile?.headline ?? null}
        location={profile?.location ?? null}
        websiteUrl={profile?.websiteUrl ?? null}
        linkedinUrl={profile?.linkedinUrl ?? null}
      />
      <PersonalDetailsForm
        initialValues={toFormValues(user.name, profile)}
        email={user.email}
        emailVerified={Boolean(user.emailVerified)}
      />
    </div>
  );
}
