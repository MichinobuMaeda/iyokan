"use client";

import { useState } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { useClientAuth } from "@/app/_client/auth";
import { updateAdmin } from "@/app/_client/firestore";
import { User } from "@/app/_types/User";
import { useI18n } from "@/app/_i18n/context";
import SvgSync from "@/app/_components/SvgSync";

export default function AdminUpdateForm({
  initialData,
}: {
  initialData: User;
}) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<User>(initialData);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { router } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateAdmin(formData);

    if (E.isLeft(result)) {
      setError(t(result.left));
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
          <label>{t("name")}</label>
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
          <label>{t("email")}</label>
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
          <div className="helper-text">{t("emailChangeNote")}</div>
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
        {t("valid")}
      </div>

      <hr />
      <div className="error">{error}</div>
      <div className="row right">
        <Link href="/" className="button outlined">
          {t("cancel")}
        </Link>
        <button type="submit" disabled={pending} className="button filled">
          <SvgSync /> {t("save")}
        </button>
      </div>
    </form>
  );
}
