"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { createApplication, updateApplication } from "@/lib/repositories/applications";
import { createApplicationSchema, updateApplicationSchema } from "@/lib/validators/applications";
import { ApplicationStatus } from "@/lib/applications";

function toDateOnly(dateString: string): Date {
  // Parse date as UTC midnight for the date string (YYYY-MM-DD)
  return new Date(dateString + "T00:00:00.000Z");
}

export async function createApplicationAction(data: {
  company: string;
  role: string;
  appliedAt: string;
  status?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!data.status) {
      return { error: "Status is required" };
    }

    const parsed = createApplicationSchema.safeParse({
      company: data.company,
      role: data.role,
      appliedAt: new Date(data.appliedAt + "T00:00:00.000Z").toISOString(),
      status: data.status,
    });

    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Invalid input";
      return { error };
    }

    const appliedAt = toDateOnly(data.appliedAt);
    await createApplication(session.user.id, {
      company: parsed.data.company,
      role: parsed.data.role,
      appliedAt,
      status: parsed.data.status as ApplicationStatus,
    });

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    if (error.message === "Applied date cannot be in the future") {
      return { error: error.message };
    }
    return { error: "Failed to create application" };
  }
}

export async function updateApplicationAction(
  id: string,
  data: {
    company?: string;
    role?: string;
    appliedAt?: string;
    status?: string;
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const updateData: any = {};
    if (data.company !== undefined) updateData.company = data.company;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.appliedAt !== undefined) {
      updateData.appliedAt = new Date(data.appliedAt + "T00:00:00.000Z").toISOString();
    }
    if (data.status !== undefined) updateData.status = data.status;

    const parsed = updateApplicationSchema.safeParse(updateData);
    if (!parsed.success) {
      const error = parsed.error.issues[0]?.message || "Invalid input";
      return { error };
    }

    const repoUpdate: any = {};
    if (parsed.data.company !== undefined) repoUpdate.company = parsed.data.company;
    if (parsed.data.role !== undefined) repoUpdate.role = parsed.data.role;
    if (parsed.data.appliedAt !== undefined) repoUpdate.appliedAt = toDateOnly(data.appliedAt!);
    if (parsed.data.status !== undefined) repoUpdate.status = parsed.data.status as ApplicationStatus;

    const result = await updateApplication(session.user.id, id, repoUpdate);
    if (!result) {
      return { error: "Application not found" };
    }

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    if (error.message === "Applied date cannot be in the future") {
      return { error: error.message };
    }
    return { error: "Failed to update application" };
  }
}

export async function getApplicationsAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { error: "Unauthorized", data: [] };
    }

    const { listApplications } = await import("@/lib/repositories/applications");
    const apps = await listApplications(session.user.id);
    
    // Serialize
    const serialized = apps.map((app: any) => ({
      id: app._id.toString(),
      company: app.company,
      role: app.role,
      appliedAt: app.appliedAt instanceof Date ? app.appliedAt.toISOString() : app.appliedAt,
      status: app.status,
      statusChangedAt: app.statusChangedAt instanceof Date ? app.statusChangedAt.toISOString() : app.statusChangedAt,
    }));
    
    return { data: serialized };
  } catch (error) {
    return { error: "Failed to fetch applications", data: [] };
  }
}
