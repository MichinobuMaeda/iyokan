"use client";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  UserCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as E from "fp-ts/Either";

import { auth, db } from "./firebase";

export interface LoginResult {
  uid: string;
  idToken: string;
}

/**
 * Signs in a user with email and password, validates they are an admin
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves to Either containing an Error or LoginResult
 */
export async function login(
  email: string,
  password: string
): Promise<E.Either<Error, LoginResult>> {
  try {
    // Sign in with Firebase Auth
    const cred: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = cred.user.uid;

    // Check if user is an admin
    const adminDoc = await getDoc(doc(db, "admins", uid));

    if (!adminDoc.exists()) {
      return E.left(new Error("Failed to login as admin"));
    }

    const adminData = adminDoc.data();
    if (!adminData?.valid) {
      return E.left(new Error("Invalid admin account"));
    }

    // Get the ID token
    const idToken = await cred.user.getIdToken();

    document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
    console.log("uid:", uid);
    console.log("ID Token:", idToken);

    return E.right({ uid, idToken });
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to login")
    );
  }
}

/**
 * Sends a password reset email to the specified email address
 * @param email - User's email address
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function resetPassword(
  email: string
): Promise<E.Either<Error, void>> {
  try {
    await sendPasswordResetEmail(auth, email);
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error
        ? error
        : new Error("Failed to send password reset email")
    );
  }
}

/**
 * Signs out the current user and clears the auth cookie
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function logout(): Promise<E.Either<Error, void>> {
  try {
    await signOut(auth);
    // Clear the auth cookie
    document.cookie = "__session=; path=/; max-age=0";
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to logout")
    );
  }
}

/**
 * Ensures user is authenticated on server-side
 * Redirects to /login if no user is logged in
 * @returns The authenticated user and router instance
 */
export function useClientAuth() {
  const router = useRouter();
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  return { user, router };
}

/**
 * Redirects to home page if user is already authenticated
 * Used in login and reset-password pages
 * @param disabled - If true, the redirect is disabled
 */
export function useRedirectIfAuthenticated(disabled = false) {
  const router = useRouter();

  useEffect(() => {
    if (disabled) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsub();
  }, [router, disabled]);
}
