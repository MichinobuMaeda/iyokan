import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { TranslationKey } from "@/app/_i18n/locales/ja";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 10;
const oidRegex = /^[a-z0-9]+$/;
const reservedOids = ["id", "oid", "admin", "admins"];

// Password validation helpers
const validatePasswordLength = (
  password: string
): E.Either<TranslationKey, string> =>
  password.length >= passwordMinLength
    ? E.right(password)
    : E.left("errorPasswordMin10");

const validatePasswordUppercase = (
  password: string
): E.Either<TranslationKey, string> =>
  /[A-Z]/.test(password) ? E.right(password) : E.left("errorPasswordUppercase");

const validatePasswordLowercase = (
  password: string
): E.Either<TranslationKey, string> =>
  /[a-z]/.test(password) ? E.right(password) : E.left("errorPasswordLowercase");

const validatePasswordNumber = (
  password: string
): E.Either<TranslationKey, string> =>
  /[0-9]/.test(password) ? E.right(password) : E.left("errorPasswordNumber");

const validatePasswordSymbol = (
  password: string
): E.Either<TranslationKey, string> =>
  /[^A-Za-z0-9]/.test(password)
    ? E.right(password)
    : E.left("errorPasswordSymbol");

// Organization ID validation helpers
const validateOidFormat = (oid: string): E.Either<TranslationKey, string> =>
  oidRegex.test(oid) ? E.right(oid) : E.left("errorOidInvalidFormat");

const validateReservedOids = (oid: string): E.Either<TranslationKey, string> =>
  reservedOids.includes(oid) ? E.left("errorOrgIdReserved") : E.right(oid);

/**
 * Checks if a string is empty or contains only whitespace
 * @param value - String value to check
 * @returns True if the string is empty or contains only whitespace, false otherwise
 */
export function isEmptyOrWhitespace(value?: string): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validates that a required string field is not empty
 * @param value - String value to validate
 * @returns Either containing an Error with i18n key or the validated string
 * @returns Left: "required" - When value is empty or whitespace
 * @returns Right: The validated string
 */
export function validateRequiredString(
  value?: string
): E.Either<TranslationKey, string> {
  return isEmptyOrWhitespace(value) ? E.left("required") : E.right(value!);
}

/**
 * Validates an email address format (optional - allows empty/whitespace)
 * @param email - Email address to validate
 * @returns Either containing an Error with i18n key or the validated email (or null/undefined if empty)
 * @returns Left: "errorInvalidEmail" - When email has invalid format
 * @returns Right: The validated email or null/undefined if empty
 */
export function validateOptionalEmail(
  email?: string
): E.Either<TranslationKey, string | null | undefined> {
  return isEmptyOrWhitespace(email) || emailRegex.test(email!)
    ? E.right(email)
    : E.left("errorInvalidEmail");
}

/**
 * Validates an email address format
 *
 * @param email - Email address to validate
 * @returns Either containing an Error with i18n key or the validated email
 * @returns Left: "errorEmailRequired" - When email is empty or whitespace
 * @returns Left: "errorInvalidEmail" - When email has invalid format
 * @returns Right: The validated email
 */
export function validateRequiredEmail(
  email?: string
): E.Either<TranslationKey, string> {
  return pipe(
    email,
    validateRequiredString,
    E.mapLeft(() => "errorEmailRequired" as TranslationKey),
    E.flatMap(validateOptionalEmail)
  ) as E.Either<TranslationKey, string>;
}

/**
 * Validates a password meets security requirements
 *
 * @param password - Password to validate
 * @returns Either containing an Error with i18n key or the validated password
 * @returns Left: "errorPasswordRequired" - When password is empty
 * @returns Left: "errorPasswordMin10" - When password is less than 10 characters
 * @returns Left: "errorPasswordUppercase" - When password lacks uppercase letter
 * @returns Left: "errorPasswordLowercase" - When password lacks lowercase letter
 * @returns Left: "errorPasswordNumber" - When password lacks numeric character
 * @returns Left: "errorPasswordSymbol" - When password lacks symbol
 * @returns Right: The validated password
 */
export function validatePassword(
  password: string
): E.Either<TranslationKey, string> {
  return pipe(
    password,
    validateRequiredString,
    E.mapLeft(() => "errorPasswordRequired" as TranslationKey),
    E.flatMap(validatePasswordLength),
    E.flatMap(validatePasswordUppercase),
    E.flatMap(validatePasswordLowercase),
    E.flatMap(validatePasswordNumber),
    E.flatMap(validatePasswordSymbol)
  );
}

/**
 * Validates an organization ID (oid) format
 *
 * @param oid - Organization ID to validate
 * @returns Either containing an Error with i18n key or the validated oid
 * @returns Left: "errorOidRequired" - When oid is empty or whitespace
 * @returns Left: "errorOidInvalidFormat" - When oid contains invalid characters
 * @returns Left: "errorOrgIdReserved" - When oid is a reserved word
 * @returns Right: The validated oid
 */
export function validateOid(oid: string): E.Either<TranslationKey, string> {
  return pipe(
    oid,
    validateRequiredString,
    E.mapLeft(() => "errorOidRequired" as TranslationKey),
    E.flatMap(validateOidFormat),
    E.flatMap(validateReservedOids)
  );
}
