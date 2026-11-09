"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { savePersonalDetailsAction } from "@/app/(workspace)/profile/actions";
import {
  PROFILE_LIMITS,
  isProfileDirty,
  type ProfileField,
  type ProfileFieldErrors,
  type ProfileFormValues,
  type ProfileValues,
} from "@/lib/profile";

type PersonalDetailsFormProps = {
  initialValues: ProfileFormValues;
  email: string;
  emailVerified: boolean;
};

const fieldOrder: ProfileField[] = [
  "name",
  "headline",
  "location",
  "websiteUrl",
  "linkedinUrl",
];

const fieldIds: Record<ProfileField, string> = {
  name: "profile-name",
  headline: "profile-headline",
  location: "profile-location",
  websiteUrl: "profile-website",
  linkedinUrl: "profile-linkedin",
};

function mergeProfile(
  base: ProfileFormValues,
  profile: ProfileValues,
): ProfileFormValues {
  return {
    ...base,
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
  };
}

function urlHint(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 && !/^https?:\/\//i.test(trimmed)
    ? "Include https://"
    : null;
}

export function PersonalDetailsForm({
  initialValues,
  email,
  emailVerified,
}: PersonalDetailsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [baseline, setBaseline] = useState(initialValues);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const linkedinRef = useRef<HTMLInputElement>(null);

  const refs: Record<ProfileField, RefObject<HTMLInputElement | null>> = {
    name: nameRef,
    headline: headlineRef,
    location: locationRef,
    websiteUrl: websiteRef,
    linkedinUrl: linkedinRef,
  };

  const dirty = isProfileDirty(values, baseline);

  function setField(field: ProfileField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError(null);
    setStatusMessage(null);
  }

  function describedBy(field: ProfileField, hint: string | null = null) {
    return (
      [
        errors[field] ? `${fieldIds[field]}-error` : null,
        hint ? `${fieldIds[field]}-hint` : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined
    );
  }

  function focusFirst(fieldErrors: ProfileFieldErrors) {
    const field = fieldOrder.find((candidate) => fieldErrors[candidate]);
    if (field) {
      refs[field].current?.focus();
    }
  }

  function handleCancel() {
    setValues(baseline);
    setErrors({});
    setFormError(null);
    setStatusMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !dirty) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFormError(null);
    setStatusMessage(null);

    try {
      const result = await savePersonalDetailsAction(values);

      if (result.status === "saved") {
        const next = { ...mergeProfile(values, result.profile), name: result.name };
        setValues(next);
        setBaseline(next);
        setStatusMessage("Profile saved.");
        router.refresh();
      } else if (result.status === "partial") {
        setValues((current) => mergeProfile(current, result.profile));
        setBaseline((current) => mergeProfile(current, result.profile));
        setErrors(result.fieldErrors);
        setFormError("Profile saved, but your name could not be updated.");
        nameRef.current?.focus();
        router.refresh();
      } else if (result.status === "invalid") {
        setErrors(result.fieldErrors);
        setFormError(result.formError ?? "Check the highlighted fields.");
        focusFirst(result.fieldErrors);
      } else if (result.status === "unauthorized") {
        router.replace("/login");
      } else {
        setFormError(result.formError);
      }
    } catch {
      setFormError("We couldn't save your profile. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const websiteHint = urlHint(values.websiteUrl);
  const linkedinHint = urlHint(values.linkedinUrl);

  return (
    <section className="profile-card" aria-labelledby="personal-details-heading">
      <header className="profile-card-header">
        <h2 id="personal-details-heading">Personal details</h2>
        <p>This is how you appear in JobFlow. Only you can see it for now.</p>
      </header>

      <form
        className="profile-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
      >
        {formError ? (
          <p className="profile-form-error" role="alert">
            {formError}
          </p>
        ) : null}
        {statusMessage ? (
          <p className="profile-status" role="status">
            {statusMessage}
          </p>
        ) : null}

        <div className="profile-fields">
          <div className="form-field profile-field-full">
            <label htmlFor={fieldIds.name}>Full name</label>
            <input
              ref={nameRef}
              id={fieldIds.name}
              type="text"
              autoComplete="name"
              maxLength={PROFILE_LIMITS.name}
              required
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
            />
            {errors.name ? (
              <p className="field-error" id={`${fieldIds.name}-error`}>
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="form-field profile-field-full">
            <label htmlFor="profile-email">Email</label>
            <input
              className="profile-readonly"
              id="profile-email"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
              aria-describedby="profile-email-note"
            />
            <p className="profile-field-note" id="profile-email-note">
              {emailVerified ? (
                <>
                  <BadgeCheck aria-hidden="true" size={14} strokeWidth={1.75} />
                  Verified
                </>
              ) : (
                <>
                  <CircleAlert aria-hidden="true" size={14} strokeWidth={1.75} />
                  Email not verified
                </>
              )}
            </p>
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.headline}>Headline</label>
            <input
              ref={headlineRef}
              id={fieldIds.headline}
              type="text"
              autoComplete="organization-title"
              maxLength={PROFILE_LIMITS.headline}
              value={values.headline}
              onChange={(event) => setField("headline", event.target.value)}
              aria-invalid={errors.headline ? true : undefined}
              aria-describedby={describedBy("headline")}
            />
            {errors.headline ? (
              <p className="field-error" id={`${fieldIds.headline}-error`}>
                {errors.headline}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.location}>Location</label>
            <input
              ref={locationRef}
              id={fieldIds.location}
              type="text"
              autoComplete="address-level2"
              maxLength={PROFILE_LIMITS.location}
              value={values.location}
              onChange={(event) => setField("location", event.target.value)}
              aria-invalid={errors.location ? true : undefined}
              aria-describedby={describedBy("location")}
            />
            {errors.location ? (
              <p className="field-error" id={`${fieldIds.location}-error`}>
                {errors.location}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.websiteUrl}>Website</label>
            <input
              ref={websiteRef}
              id={fieldIds.websiteUrl}
              type="url"
              inputMode="url"
              autoComplete="url"
              maxLength={PROFILE_LIMITS.url}
              placeholder="https://example.com"
              value={values.websiteUrl}
              onChange={(event) => setField("websiteUrl", event.target.value)}
              aria-invalid={errors.websiteUrl ? true : undefined}
              aria-describedby={describedBy("websiteUrl", websiteHint)}
            />
            {websiteHint ? (
              <p className="profile-field-hint" id={`${fieldIds.websiteUrl}-hint`}>
                {websiteHint}
              </p>
            ) : null}
            {errors.websiteUrl ? (
              <p className="field-error" id={`${fieldIds.websiteUrl}-error`}>
                {errors.websiteUrl}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor={fieldIds.linkedinUrl}>LinkedIn</label>
            <input
              ref={linkedinRef}
              id={fieldIds.linkedinUrl}
              type="url"
              inputMode="url"
              autoComplete="url"
              maxLength={PROFILE_LIMITS.url}
              placeholder="https://www.linkedin.com/in/you"
              value={values.linkedinUrl}
              onChange={(event) => setField("linkedinUrl", event.target.value)}
              aria-invalid={errors.linkedinUrl ? true : undefined}
              aria-describedby={describedBy("linkedinUrl", linkedinHint)}
            />
            {linkedinHint ? (
              <p className="profile-field-hint" id={`${fieldIds.linkedinUrl}-hint`}>
                {linkedinHint}
              </p>
            ) : null}
            {errors.linkedinUrl ? (
              <p className="field-error" id={`${fieldIds.linkedinUrl}-error`}>
                {errors.linkedinUrl}
              </p>
            ) : null}
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={!dirty || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </section>
  );
}
