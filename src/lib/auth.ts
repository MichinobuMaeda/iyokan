import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
} from "firebase/auth";
import { getDefaultStore } from "jotai";
import * as E from "fp-ts/Either";

import type { TranslationKey } from "../i18n/i18n";
import { auth } from "./firebase";
import { authUserAtom } from "./store";
import { setAppState } from "./app";

export function listenAuthState() {
  console.info("Start listenAuthState()");
  onAuthStateChanged(auth, (user) => {
    console.info("listenAuthState() uid:", user?.uid);
    const store = getDefaultStore();
    const prevUser = store.get(authUserAtom);
    store.set(authUserAtom, user);

    if (prevUser?.uid !== user?.uid) {
      setAppState(store, user);
    }
  });
}

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
}: LoginData): Promise<E.Either<TranslationKey, void>> {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    return E.right(undefined);
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
}: ResetPasswordData): Promise<E.Either<TranslationKey, void>> {
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
export async function logout(): Promise<E.Either<TranslationKey, void>> {
  try {
    console.info("logout()");
    await signOut(auth);
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
): Promise<E.Either<TranslationKey, void>> {
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
  password: string;
  newEmail: string;
  confirmation: string;
}

/**
 * Changes the user's email address after re-authentication
 * @param password - User's current password for re-authentication
 * @param newEmail - New email address
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function changeEmail({
  password,
  newEmail,
  confirmation,
}: ChangeEmailData): Promise<E.Either<TranslationKey, void>> {
  if (newEmail !== confirmation) {
    return E.left("errorChangeEmail");
  }

  try {
    // Re-authenticate first
    const reauthResult = await reauthenticate(password);
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
  password: string;
  newPassword: string;
  confirmation: string;
}

/**
 * Changes the user's password after re-authentication
 * @param password - User's current password for re-authentication
 * @param newPassword - New password
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function changePassword({
  password,
  newPassword,
  confirmation,
}: ChangePasswordData): Promise<E.Either<TranslationKey, void>> {
  if (newPassword !== confirmation) {
    return E.left("errorChangePassword");
  }
  try {
    // Re-authenticate first
    const reauthResult = await reauthenticate(password);
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
