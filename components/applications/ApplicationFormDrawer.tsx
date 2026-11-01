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
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: ApplicationFormData;
  onSuccess?: () => void;
};

const statusOptions = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function ApplicationFormDrawer({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: ApplicationFormDrawerProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    company: "",
    role: "",
    appliedAt: "",
    status: "applied",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === "edit" && initialData) {
      setFormData(initialData);
    } else if (isOpen && mode === "create") {
      setFormData({
        company: "",
        role: "",
        appliedAt: "",
        status: "applied",
      });
    }
    setErrors({});
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="relative ml-auto w-full max-w-md h-full border-l border-border flex flex-col shadow-xl transform transition-transform duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{ animation: "slideIn 200ms ease-out", backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="drawer-title" className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            {mode === "create" ? "Add Application" : "Edit Application"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" style={{ color: "var(--text)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: "contain" }}>
          {errors.general && (
            <div className="p-3 rounded-md bg-danger/10 border border-danger/20">
              <p className="text-sm" style={{ color: "var(--danger)" }}>
                {errors.general}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
              Company *
            </label>
            <input
              ref={firstInputRef}
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ color: "var(--text)" }}
              maxLength={200}
              required
            />
            {errors.company && (
              <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                {errors.company}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
              Role *
            </label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ color: "var(--text)" }}
              maxLength={200}
              required
            />
            {errors.role && (
              <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                {errors.role}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="appliedAt" className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
              Applied Date *
            </label>
            <input
              id="appliedAt"
              type="date"
              value={formData.appliedAt}
              onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ color: "var(--text)" }}
              required
            />
            {errors.appliedAt && (
              <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                {errors.appliedAt}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
              Status *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ color: "var(--text)" }}
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                {errors.status}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-border bg-surface hover:bg-surface-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ color: "var(--text)" }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md transition-colors disabled:opacity-50 active:scale-96 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--primary)", color: "var(--canvas)", transformOrigin: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
