"use client";

import { useState } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { saveOrg } from "@/app/_client/firestore";
import { OrgData } from "@/app/_types/Org";
import { validateOid } from "@/app/_lib/validators";
import { useI18n } from "@/app/_i18n/context";
import SvgSync from "@/app/_icons/SvgSync";

export default function CreateOrgPage() {
  const { t } = useI18n();
  const [oid, setOid] = useState("");
  const [formData, setFormData] = useState<OrgData>({
    name: "",
    desc: "",
    valid: true,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();
  const { router } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    if (!oid || !formData.name) {
      setErrorOnSave(t("errorOrgIdNameRequired"));
      setPending(false);
      return;
    }

    const oidValidation = validateOid(oid);
    if (E.isLeft(oidValidation)) {
      setErrorOnSave(t(oidValidation.left));
      setPending(false);
      return;
    }

    const result = await saveOrg(oid, formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
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
              value={oid}
              onChange={(e) => setOid(e.target.value.toLowerCase())}
              placeholder={t("id")}
              pattern="[a-z0-9]+"
              title="Only lowercase letters and numbers are allowed"
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
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              placeholder={t("description")}
              disabled={pending}
              style={{ width: "100%" }}
              rows={3}
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
            checked={formData.valid}
            onChange={(e) =>
              setFormData({ ...formData, valid: e.target.checked })
            }
          />
          {t("active")}
        </label>

        <hr />
        {errorOnSave && <div className="message error">{errorOnSave}</div>}
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
