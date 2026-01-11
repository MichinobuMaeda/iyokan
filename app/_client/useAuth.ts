"use client";

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

import { auth } from "./firebase";

/**
 * Ensures user is authenticated on server-side
 * Redirects to /login if no user is logged in
 * @returns The authenticated user and router instance
 */
export function useAuth() {
  const router = useRouter();
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  return { user, router };
}
