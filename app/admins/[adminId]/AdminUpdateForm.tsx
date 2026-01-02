"use client";

import { useState } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { useClientAuth } from "@/app/_client/auth";
import { updateAdmin } from "@/app/_client/firestore";
import { UserData } from "@/app/_types/User";
import SvgSync from "@/app/_components/SvgSync";

interface AdminUpdateFormProps {
  adminId: string;
  initialData: UserData;
}

export default function AdminUpdateForm({
  adminId,
  initialData,
}: AdminUpdateFormProps) {
  const [formData, setFormData] = useState<UserData>(initialData);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { router } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateAdmin(adminId, formData);

    if (E.isLeft(result)) {
      setError(result.left.message);
      setPending(false);
    } else {
      setPending(false);
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="textfield outlined" style={{ width: "100%" }}>
          <label>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="row">
        <div className="textfield outlined" style={{ width: "100%" }}>
          <label>E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            required
            readOnly
            disabled={pending}
            style={{ width: "100%" }}
          />
          <div className="helper-text">
            Only the account holder can change their email
          </div>
        </div>
      </div>

      <div className="row">
        <input
          id="valid"
          type="checkbox"
          className="switch"
          checked={formData.valid}
          onChange={(e) =>
            setFormData({ ...formData, valid: e.target.checked })
          }
        />
        Valid
      </div>

      <hr />
      <div className="error">{error}</div>
      <div className="row right">
        <Link href="/" className="button outlined">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="button filled">
          <SvgSync /> Save
        </button>
      </div>
    </form>
  );
}
