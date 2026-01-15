"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as E from "fp-ts/Either";

import { updateOrg } from "@/app/_client/firestore";
import { Org } from "@/app/_types/Org";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";

export default function OrgUpdateForm({ initialData }: { initialData: Org }) {
  const { t } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState<Org>(initialData);
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrorOnSave(undefined);

    const result = await updateOrg(formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      setPending(false);
      router.push("/");
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      errorOnSave={errorOnSave}
      returnPath="/"
      disabled={pending}
    >
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
          id="valid"
          type="checkbox"
          className="switch"
          checked={formData.valid}
          onChange={(e) =>
            setFormData({ ...formData, valid: e.target.checked })
          }
        />
        {t("active")}
      </div>
    </Form>
  );
}
