"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { saveProfile } from "@/lib/repositories/profiles";
import {
  savePersonalDetails,
  type ProfileSaveInput,
  type ProfileSaveResult,
} from "@/lib/profile-save";

async function updateUserName(name: string) {
  await auth.api.updateUser({
    body: { name },
    headers: await headers(),
  });
}

export async function savePersonalDetailsAction(
  input: ProfileSaveInput,
): Promise<ProfileSaveResult> {
  const result = await savePersonalDetails(input, {
    getSession: async () => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) {
        return null;
      }

      return {
        userId: session.user.id,
        name: session.user.name ?? "",
      };
    },
    saveProfile,
    updateUserName,
  });

  if (result.status === "saved" || result.status === "partial") {
    revalidatePath("/profile");
  }

  return result;
}
