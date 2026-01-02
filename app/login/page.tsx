"use client";

import { useState, FormEvent } from "react";
import { login } from "@/app/_client/auth";
import { useRedirectIfAuthenticated } from "@/app/_client/auth";
import Link from "next/link";
import * as E from "fp-ts/Either";

export default function LoginPage() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useRedirectIfAuthenticated(pending);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await login(email, password);

    if (E.isLeft(result)) {
      setError(result.left.message);
      setPending(false);
    } else {
      console.info("Login success");
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
