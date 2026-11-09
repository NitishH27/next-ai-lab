import {
  toProfileView,
  type ProfileFieldErrors,
  type ProfileView,
  type ProfileValues,
} from './profile.ts';
import { personalDetailsSchema } from './validators/profile.ts';
import type { StoredProfile } from './repositories/profiles-core.ts';

export type ProfileSaveInput = {
  name: string;
  headline: string;
  location: string;
  websiteUrl: string;
  linkedinUrl: string;
};

export type ProfileSaveSession = {
  userId: string;
  name: string;
};

export type ProfileSaveResult =
  | { status: 'saved'; profile: ProfileView; name: string }
  | { status: 'partial'; profile: ProfileView; fieldErrors: { name: string } }
  | { status: 'invalid'; fieldErrors: ProfileFieldErrors; formError?: string }
  | { status: 'unauthorized' }
  | { status: 'error'; formError: string };

export type ProfileSaveDeps = {
  getSession: () => Promise<ProfileSaveSession | null>;
  saveProfile: (userId: string, values: ProfileValues) => Promise<StoredProfile | null>;
  updateUserName: (name: string) => Promise<void>;
};

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: ProfileFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in errors)) {
      errors[field as keyof ProfileFieldErrors] = issue.message;
    }
  }

  return errors;
}

export async function savePersonalDetails(
  input: ProfileSaveInput,
  deps: ProfileSaveDeps,
): Promise<ProfileSaveResult> {
  const session = await deps.getSession();
  if (!session) {
    return { status: 'unauthorized' };
  }

  const parsed = personalDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'invalid',
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      formError: 'Check the highlighted fields.',
    };
  }

  try {
    const saved = await deps.saveProfile(session.userId, {
      headline: parsed.data.headline,
      location: parsed.data.location,
      websiteUrl: parsed.data.websiteUrl,
      linkedinUrl: parsed.data.linkedinUrl,
    });

    if (!saved) {
      return {
        status: 'error',
        formError: "We couldn't save your profile. Try again.",
      };
    }

    const profile = toProfileView(saved);

    if (parsed.data.name === session.name.trim()) {
      return { status: 'saved', profile, name: session.name };
    }

    try {
      await deps.updateUserName(parsed.data.name);
    } catch {
      return {
        status: 'partial',
        profile,
        fieldErrors: { name: 'Your name could not be updated. Try again.' },
      };
    }

    return { status: 'saved', profile, name: parsed.data.name };
  } catch {
    return {
      status: 'error',
      formError: "We couldn't save your profile. Try again.",
    };
  }
}
