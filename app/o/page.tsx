"use client";

import { useState } from "react";
import { useClientAuth } from "@/app/_client/auth";
import { saveOrg } from "@/app/_client/firestore";
import { useI18n } from "@/app/_i18n/context";
import Link from "next/link";
import * as E from "fp-ts/Either";

import SvgSync from "../_components/SvgSync";

export default function CreateOrgPage() {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { router } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const oid = String(formData.get("oid") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const desc = String(formData.get("desc") || "").trim();
    const active = formData.get("active") === "on";

    if (!oid || !name) {
      setError(t("errorOrgIdNameRequired"));
      setPending(false);
      return;
    }

    const result = await saveOrg(oid, {
      name,
      desc: desc || undefined,
      active,
    });

    if (E.isLeft(result)) {
      setError(t(result.left));
      setPending(false);
    } else {
      setPending(false);
      router.push("/");
    }
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>{t("addOrganization")}</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("id")}</label>
            <input
              id="oid"
              name="oid"
              type="text"
              placeholder={t("id")}
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("name")}</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder={t("name")}
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
              placeholder={t("description")}
              disabled={pending}
              style={{ width: "100%" }}
              rows={3}
            />
          </div>
        </div>

        <label className="row">
          <input
            id="active"
            name="active"
            className="switch"
            type="checkbox"
            disabled={pending}
            defaultChecked
          />
          {t("active")}
        </label>

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
    </main>
  );
}
