"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { auth, functions } from "@/app/lib/firebase-client";

export default function AdminsPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();
  const user = auth.currentUser;

  if (!user) {
    redirect("/login");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const valid = formData.get("valid") === "on";

    if (!email || !name) {
      setError("Name and email are required");
      setPending(false);
      return;
    }

    try {
      const createAdmin = httpsCallable(functions, "createAdmin");
      await createAdmin({ email, name, valid });
      setSuccess("Admin creation requested");
      form.reset();
      // Navigate to top page
      router.push("/");
    } catch (err) {
      console.error("createAdmin error:", err);
      setError("Failed to create admin");
    } finally {
      setPending(false);
    }
  };

  return (
    <main style={{ maxWidth: "32rem", width: "100%" }}>
      <form className="column" onSubmit={handleSubmit}>
        <h3>Create Admin</h3>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <label className="row">
          <input
            id="valid"
            name="valid"
            className="switch"
            type="checkbox"
            disabled={pending}
          />
          Valid
        </label>

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
          {pending ? "Creating..." : "Create admin"}
        </button>
      </form>
    </main>
  );
}
