"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { updateOrg } from "@/app/_client/firestore";
import { Org } from "@/app/_types/Org";
import { useI18n } from "@/app/_i18n/context";
import SvgSync from "@/app/_components/SvgSync";

export default function OrgUpdateForm({ initialData }: { initialData: Org }) {
  const { t } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState<Org>(initialData);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateOrg(formData);

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
          <label>{t("description")}</label>
          <textarea
            id="desc"
            name="desc"
            value={formData.desc || ""}
            onChange={(e) =>
              setFormData({ ...formData, desc: e.target.value || undefined })
            }
            rows={3}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="row">
        <input
          id="active"
          type="checkbox"
          className="switch"
          checked={formData.active}
          onChange={(e) =>
            setFormData({ ...formData, active: e.target.checked })
          }
        />
        {t("active")}
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
