const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Record<string, string>;

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export function validateSignup(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
): FieldErrors {
  const errors = validateLogin(email, password);

  if (!fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

