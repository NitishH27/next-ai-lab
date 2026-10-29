import { z } from 'zod';

export const applicationStatusSchema = z.enum([
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]);

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be 200 characters or less'),
  role: z.string().trim().min(1, 'Role is required').max(200, 'Role must be 200 characters or less'),
  appliedAt: z.coerce.date(),
  status: applicationStatusSchema.optional().default('applied'),
});

export const updateApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be 200 characters or less').optional(),
  role: z.string().trim().min(1, 'Role is required').max(200, 'Role must be 200 characters or less').optional(),
  appliedAt: z.coerce.date().optional(),
  status: applicationStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
