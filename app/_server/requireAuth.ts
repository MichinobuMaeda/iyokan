import { redirect } from "next/navigation";
import type { Auth } from "firebase/auth";

/**
 * Ensures user is authenticated on server-side
 * Redirects to /login if no user is logged in
 * @param auth - Firebase Auth instance from getServerApp()
 */
export function requireAuth(auth: Auth): void {
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }
}
