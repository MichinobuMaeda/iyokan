"use client";

import { useState, FormEvent, useEffect } from "react";
import { sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase-client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send password reset email.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main style={{ maxWidth: "32rem", width: "100%" }}>
      <form className="column" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
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

        {error && (
          <div className="row" style={{ color: "red" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="row" style={{ color: "green" }}>
            {success}
          </div>
        )}

        <button type="submit" className="button filled" disabled={pending}>
          {pending ? "Sending..." : "Send reset email"}
        </button>
      </form>
    </main>
  );
}
