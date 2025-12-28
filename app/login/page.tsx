"use client";

import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.info("Login success");
      router.push("/");
    } catch (err: unknown) {
      setError("Invalid credentials");
      console.error("Login error:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="row">
          <div className="textfield outlined">
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
          <div className="textfield outlined">
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
        <button type="submit" className="button filled" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
