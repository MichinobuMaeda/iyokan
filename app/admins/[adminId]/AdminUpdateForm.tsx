"use client";

import { useState } from "react";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { updateAdmin } from "@/app/_client/firestore";
import { User } from "@/app/_types/User";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";

export default function AdminUpdateForm({
  initialData,
}: {
  initialData: User;
}) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<User>(initialData);
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>(undefined);
  const { router } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrorOnSave(undefined);

    const result = await updateAdmin(formData);

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
    </Form>
  );
}
