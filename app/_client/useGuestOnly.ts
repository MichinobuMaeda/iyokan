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

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get the ID token
        const idToken = await user.getIdToken();
        console.log("ID Token:", idToken);
        document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
        router.replace("/");
      } else {
        document.cookie = "__session=; path=/; max-age=0";
        console.log("ID Token cleared");
      }
    });
    return () => unsub();
  }, [router, disabled]);
}
