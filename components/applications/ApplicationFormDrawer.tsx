"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createApplicationAction, updateApplicationAction } from "@/app/(workspace)/applications/actions";

type ApplicationFormData = {
  id?: string;
  company: string;
  role: string;
  appliedAt: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
};

type ApplicationFormDrawerProps = {
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: ApplicationFormData;
  onSuccess?: () => void;
};

const emptyForm: ApplicationFormData = {
  company: "",
  role: "",
  appliedAt: "",
  status: "applied",
};

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ApplicationFormDrawer({
  onClose,
  mode,
  initialData,
  onSuccess,
}: ApplicationFormDrawerProps) {
  const [formData, setFormData] = useState<ApplicationFormData>(
    mode === "edit" && initialData ? initialData : emptyForm,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    } else if (formData.company.trim().length > 200) {
      newErrors.company = "Company must be 200 characters or less";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    } else if (formData.role.trim().length > 200) {
      newErrors.role = "Role must be 200 characters or less";
    }

    if (!formData.appliedAt) {
      newErrors.appliedAt = "Applied date is required";
    } else {
      const selectedDate = new Date(formData.appliedAt + "T00:00:00.000Z");
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      if (selectedDate > today) {
        newErrors.appliedAt = "Applied date cannot be in the future";
      }
    }

    if (!["applied", "screening", "interview", "offer", "rejected", "withdrawn"].includes(formData.status)) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const result = await createApplicationAction({
          company: formData.company.trim(),
          role: formData.role.trim(),
          appliedAt: formData.appliedAt,
          status: formData.status,
        });
        if (result.error) {
          setErrors({ general: result.error });
        } else {
          onSuccess?.();
          onClose();
        }
      } else if (mode === "edit" && formData.id) {
        const result = await updateApplicationAction(formData.id, {
          company: formData.company.trim(),
          role: formData.role.trim(),
          appliedAt: formData.appliedAt,
          status: formData.status,
        });
        if (result.error) {
          setErrors({ general: result.error });
        } else {
          onSuccess?.();
          onClose();
        }
      }
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-layer">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={drawerRef}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="drawer-header">
          <h2 id="drawer-title">{mode === "create" ? "Add application" : "Edit application"}</h2>
          <button type="button" onClick={onClose} className="drawer-close" aria-label="Close">
            <X size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form" noValidate>
          {errors.general && (
            <p className="drawer-error" role="alert">
              {errors.general}
            </p>
          )}

          <div className="form-field">
            <label htmlFor="company">Company</label>
            <input
              ref={firstInputRef}
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              maxLength={200}
              aria-invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "company-error" : undefined}
              required
            />
            {errors.company && (
              <p id="company-error" className="field-error" role="alert">
                {errors.company}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              maxLength={200}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? "role-error" : undefined}
              required
            />
            {errors.role && (
              <p id="role-error" className="field-error" role="alert">
                {errors.role}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="appliedAt">Applied date</label>
            <input
              id="appliedAt"
              type="date"
              value={formData.appliedAt}
              onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
              aria-invalid={Boolean(errors.appliedAt)}
              aria-describedby={errors.appliedAt ? "appliedAt-error" : undefined}
              required
            />
            {errors.appliedAt && (
              <p id="appliedAt-error" className="field-error" role="alert">
                {errors.appliedAt}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationFormData["status"] })}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? "status-error" : undefined}
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p id="status-error" className="field-error" role="alert">
                {errors.status}
              </p>
            )}
          </div>

          <div className="drawer-actions">
            <button type="button" onClick={onClose} className="button button-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create application" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
