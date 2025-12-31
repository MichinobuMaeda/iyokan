"use client";

import { useState, FormEvent, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (idToken) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("User UID:", user.uid);

          // Check if user is an admin
          const admin = await getDoc(doc(db, "admins", user.uid));
          console.log(admin.toJSON());
          console.log("User document data:", admin.data());

          if (!admin.exists()) {
            setError("Failed to login as admin");
            setIdToken(null);
            // return;
          }

          if (!admin.data()?.valid) {
            setError("Invalid admin account");
            setIdToken(null);
            // return;
          }

          // Get the ID token and set it in a cookie
          document.cookie = `__session=${idToken}; path=/; max-age=3600; SameSite=Lax`;
          console.info("Login success");
          router.replace("/");
        } else {
          // Clear the auth cookie
          document.cookie = "__session=; path=/; max-age=0";
          console.log("No user is signed in");
        }
      });
      return () => unsub();
    }
  }, [idToken, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      console.log("uid:", uid);
      const idToken = await cred.user.getIdToken();
      console.log("ID Token:", idToken);
      setIdToken(idToken);
    } catch (err: unknown) {
      console.error("Auth error:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <main style={{ maxWidth: "32rem", width: "100%" }}>
      <form className="column" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email"
              disabled={pending}
            />
          </div>
        </div>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              disabled={pending}
            />
          </div>
        </div>
        {error && (
          <div className="row" style={{ color: "red" }}>
            {error}
          </div>
        )}

        <div className="row">
          <Link href="/reset-password">Forgot password?</Link>
        </div>
        <button type="submit" className="button filled" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
