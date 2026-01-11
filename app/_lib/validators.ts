import * as E from "fp-ts/Either";

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns Either containing an Error with i18n key or the validated email
 */
export function validateEmail(
  email: string
): E.Either<"errorEmailRequired" | "errorInvalidEmail", string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    return E.left("errorEmailRequired");
  }

  if (!emailRegex.test(email)) {
    return E.left("errorInvalidEmail");
  }

  return E.right(email);
}

/**
 * Validates a password meets security requirements
 * Password must:
 * - Be at least 10 characters long
 * - Contain at least one uppercase letter
 * - Contain at least one lowercase letter
 * - Contain at least one numeric character
 * - Contain at least one symbol
 *
 * @param password - Password to validate
 * @returns Either containing an Error with i18n key or the validated password
 */
export function validatePassword(
  password: string
): E.Either<
  | "required"
  | "errorPasswordMin10"
  | "errorPasswordUppercase"
  | "errorPasswordLowercase"
  | "errorPasswordNumber"
  | "errorPasswordSymbol",
  string
> {
  if (!password || password.length === 0) {
    return E.left("required");
  }

  if (password.length < 10) {
    return E.left("errorPasswordMin10");
  }

  if (!/[A-Z]/.test(password)) {
    return E.left("errorPasswordUppercase");
  }

  if (!/[a-z]/.test(password)) {
    return E.left("errorPasswordLowercase");
  }

  if (!/[0-9]/.test(password)) {
    return E.left("errorPasswordNumber");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return E.left("errorPasswordSymbol");
  }

  return E.right(password);
}

const reservedOids = ["id", "oid", "admin", "admins"];

/**
 * Validates an organization ID (oid) format
 * Organization ID must:
 * - Not be empty
 * - Contain only lowercase letters (a-z) and numbers (0-9)
 * - Not be a reserved word
 *
 * @param oid - Organization ID to validate
 * @returns Either containing an Error with i18n key or the validated oid
 */
export function validateOid(
  oid: string
): E.Either<
  "errorOidRequired" | "errorOidInvalidFormat" | "errorOrgIdReserved",
  string
> {
  if (!oid || oid.trim().length === 0) {
    return E.left("errorOidRequired");
  }

  // Only lowercase letters and numbers allowed
  if (!/^[a-z0-9]+$/.test(oid)) {
    return E.left("errorOidInvalidFormat");
  }

  // Check if oid is reserved
  if (reservedOids.includes(oid.toLowerCase())) {
    return E.left("errorOrgIdReserved");
  }

  return E.right(oid);
}
