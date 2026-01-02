"use client";

import { useState, FormEvent } from "react";
import { resetPassword } from "@/app/_client/auth";
import { useRedirectIfAuthenticated } from "@/app/_client/auth";
import * as E from "fp-ts/Either";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();

  useRedirectIfAuthenticated();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) || "";

    const result = await resetPassword(email);

    if (E.isLeft(result)) {
      setError(result.left.message);
    } else {
      setSuccess("Password reset email sent. Check your inbox.");
    }

    setPending(false);
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
