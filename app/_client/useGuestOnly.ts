"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { auth } from "./firebase";

/**
 * Redirects to home page if user is already authenticated
 * Used in login and reset-password pages
 * @param disabled - If true, the redirect is disabled
 */
export function useGuestOnly(disabled = false) {
  const router = useRouter();

  useEffect(() => {
    if (disabled) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsub();
  }, [router, disabled]);
}
