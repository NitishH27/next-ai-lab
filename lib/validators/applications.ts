import { z } from "zod";
import type { ApplicationStatus } from "@/lib/applications";

export const APPLICATION_STATUSES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const satisfies readonly ApplicationStatus[];

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES, {
  error: "Status is invalid.",
});

const companySchema = z
  .string()
  .trim()
  .min(1, "Company is required.")
  .max(200, "Company must be 200 characters or fewer.");

const roleSchema = z
  .string()
  .trim()
  .min(1, "Role is required.")
  .max(200, "Role must be 200 characters or fewer.");

const appliedAtSchema = z.coerce.date({
  error: "Applied date must be a valid date.",
});

export const createApplicationSchema = z.object({
  company: companySchema,
  role: roleSchema,
  appliedAt: appliedAtSchema,
  status: applicationStatusSchema.optional().default("applied"),
});

export const updateApplicationSchema = z
  .object({
    company: companySchema.optional(),
    role: roleSchema.optional(),
    appliedAt: appliedAtSchema.optional(),
    status: applicationStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export class ApplicationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationValidationError";
  }
}

export function assertAppliedAtNotFuture(date: Date, now = new Date()): void {
  if (Number.isNaN(date.getTime())) {
    throw new ApplicationValidationError("appliedAt must be a valid date.");
  }

  if (date.getTime() > now.getTime()) {
    throw new ApplicationValidationError("appliedAt cannot be in the future.");
  }
}
