"use client";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  UserCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import * as E from "fp-ts/Either";

import { auth, db } from "./firebase";

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Signs in a user with email and password, validates they are an admin
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves to Either containing an i18n key or LoginResult
 */
export async function login({
  email,
  password,
}: LoginData): Promise<
  E.Either<"errorLoginNotAdmin" | "errorInvalidAdmin" | "errorLogin", string>
> {
  try {
    // Sign in with Firebase Auth
    const cred: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = cred.user.uid;
    console.log("uid:", uid);

    // Check if user is an admin
    const adminDoc = await getDoc(doc(db, "admins", uid));

    if (!adminDoc.exists()) {
      return E.left("errorLoginNotAdmin");
    }

    const adminData = adminDoc.data();
    if (!adminData?.valid) {
      return E.left("errorInvalidAdmin");
    }

    return E.right(uid);
  } catch (error) {
    console.error("login error:", error);
    return E.left("errorLogin");
  }
}

export interface ResetPasswordData {
  email: string;
}

/**
 * Sends a password reset email to the specified email address
 * @param email - User's email address
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function resetPassword({
  email,
}: ResetPasswordData): Promise<E.Either<"errorResetPassword", void>> {
  try {
    await sendPasswordResetEmail(auth, email);
    return E.right(undefined);
  } catch (error) {
    console.error("resetPassword error:", error);
    return E.left("errorResetPassword");
  }
}

/**
 * Signs out the current user and clears the auth cookie
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function logout(): Promise<E.Either<"errorLogout", void>> {
  try {
    await signOut(auth);
    // Clear the auth cookie
    document.cookie = "__session=; path=/; max-age=0";
    return E.right(undefined);
  } catch (error) {
    console.error("logout error:", error);
    return E.left("errorLogout");
  }
}

/**
 * Re-authenticates a user with their current password
 * Required before sensitive operations like email or password changes
 * @param currentPassword - User's current password
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function reauthenticate(
  currentPassword: string
): Promise<E.Either<"errorNoUser" | "errorReauthenticate", void>> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return E.left("errorNoUser");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    return E.right(undefined);
  } catch (error) {
    console.error("reauthenticate error:", error);
    return E.left("errorReauthenticate");
  }
}

export interface ChangeEmailData {
  currentPassword: string;
  newEmail: string;
  confirmEmail: string;
}

/**
 * Changes the user's email address after re-authentication
 * @param currentPassword - User's current password for re-authentication
 * @param newEmail - New email address
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function changeEmail({
  currentPassword,
  newEmail,
  confirmEmail,
}: ChangeEmailData): Promise<
  E.Either<"errorNoUser" | "errorReauthenticate" | "errorChangeEmail", void>
> {
  if (newEmail !== confirmEmail) {
    return E.left("errorChangeEmail");
  }

  try {
    // Re-authenticate first
    const reauthResult = await reauthenticate(currentPassword);
    if (E.isLeft(reauthResult)) {
      return reauthResult;
    }

    const user = auth.currentUser;
    if (!user) {
      return E.left("errorNoUser");
    }

    await updateEmail(user, newEmail);
    return E.right(undefined);
  } catch (error) {
    console.error("changeEmail error:", error);
    return E.left("errorChangeEmail");
  }
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Changes the user's password after re-authentication
 * @param currentPassword - User's current password for re-authentication
 * @param newPassword - New password
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function changePassword({
  currentPassword,
  newPassword,
  confirmPassword,
}: ChangePasswordData): Promise<
  E.Either<"errorNoUser" | "errorReauthenticate" | "errorChangePassword", void>
> {
  if (newPassword !== confirmPassword) {
    return E.left("errorChangePassword");
  }
  try {
    // Re-authenticate first
    const reauthResult = await reauthenticate(currentPassword);
    if (E.isLeft(reauthResult)) {
      return reauthResult;
    }

    const user = auth.currentUser;
    if (!user) {
      return E.left("errorNoUser");
    }

    await updatePassword(user, newPassword);
    return E.right(undefined);
  } catch (error) {
    console.error("changePassword error:", error);
    return E.left("errorChangePassword");
  }
}
