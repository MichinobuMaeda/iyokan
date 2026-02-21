import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  type User,
  type ActionCodeSettings,
} from "firebase/auth";
import { getDefaultStore } from "jotai";
import * as E from "fp-ts/Either";

import type { TranslationKey } from "../i18n/i18n";
import { auth } from "./firebase";
import { authUserAtom, localeAtom } from "./store";
import { setAppState } from "./app";

const keySendLinkEmail = "iyokan-sendLinkEmail";
const keySignInWithGoogle = "iyokan-signInWithGoogle";

/**
 * Redirects to URL without query parameters if query parameters exist
 */
export const redirectToCleanUrl = () => {
  const url = window.location.href;
  if (url.includes("?")) {
    window.location.href = url.split("?")[0];
  }
};

export const handleSignInWithGoogleRedirect = async () => {
  const ts = window.localStorage.getItem(keySignInWithGoogle);

  if (!ts) {
    return;
  }

  window.localStorage.removeItem(keySignInWithGoogle);

  if (Date.now() - new Date(ts).getTime() >= 5 * 60 * 1000) {
    return;
  }

  try {
    await getRedirectResult(auth);
    console.info("Successfully signed in with Google redirect");
  } catch (error) {
    console.error("Error handling Google sign-in redirect:", error);
  }
};

export const handleSignInWithEmailLink = async () => {
  const url = window.location.href;
  console.info("handleSignInWithEmailLink() url:", url);

  if (!isSignInWithEmailLink(auth, url)) {
    return;
  }

  const email = localStorage.getItem(keySendLinkEmail);
  localStorage.removeItem(keySendLinkEmail);
  console.log("Email link sign-in detected. Email:", email);

  if (!email) {
    console.error("Email is required to sign in with email link");
    return;
  }

  try {
    const result = await signInWithEmailLink(auth, email, url);
    console.info("Successfully signed in with email link:", result);
  } catch (error) {
    console.error("Error signing in with email link:", error);
  }
};

export const handleAuthChanged = (user: User | null) => {
  console.info("handleAuthChanged() uid:", user?.uid);
  const store = getDefaultStore();
  const prevUser = store.get(authUserAtom);
  store.set(authUserAtom, user);

  if (prevUser?.uid !== user?.uid) {
    setAppState(store, user);
  }
};

/**
 * Initializes authentication system
 * Handles email link sign-in if present in the URL
 * Sets up a listener for authentication state changes
 * Updates the authUserAtom and calls setAppState when user changes
 */
export function initAuth() {
  Promise.resolve().then(async () =>
    handleSignInWithGoogleRedirect()
      .then(() => handleSignInWithEmailLink())
      .then(() => redirectToCleanUrl())
      .then(() => onAuthStateChanged(auth, handleAuthChanged))
  );
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

export interface SendLoginLinkData {
  email: string;
}

/**
 * Sends a sign-in link to the specified email address
 * The link allows passwordless authentication via email
 * Stores the email in localStorage for verification after redirect
 * @param email - User's email address to send the login link to
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function sendLoginLink({
  email,
}: SendLoginLinkData): Promise<E.Either<TranslationKey, void>> {
  try {
    auth.languageCode = getDefaultStore().get(localeAtom);
    const actionCodeSettings: ActionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem(keySendLinkEmail, email);
    return E.right(undefined);
  } catch (error) {
    console.error("sendLoginLink error:", error);
    return E.left("errorSendLoginLink");
  }
}

export async function signInWithGoogle(): Promise<
  E.Either<TranslationKey, void>
> {
  try {
    auth.languageCode = getDefaultStore().get(localeAtom);
    await signInWithRedirect(auth, new GoogleAuthProvider());
    window.localStorage.setItem(keySignInWithGoogle, new Date().toISOString());
    return E.right(undefined);
  } catch (error) {
    console.error("Google sign-in error:", error);
    return E.left("errorSignInWithGoogle");
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
