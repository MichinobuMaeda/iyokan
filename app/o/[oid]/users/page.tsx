"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { createUser } from "@/app/_client/functions";
import { UserData } from "@/app/_types/User";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";

export default function UsersPage() {
  const { t } = useI18n();
  const params = useParams<{ oid: string }>();
  const oid = params?.oid ?? "";
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    valid: true,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();
  const { router } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    if (!formData.email || !formData.name) {
      setErrorOnSave(t("errorNameEmailRequired"));
      setPending(false);
      return;
    }

    const result = await createUser(oid, formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      setPending(false);
      router.push(`/o/${oid}`);
    }
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        errorOnSave={errorOnSave}
        returnPath={`/o/${oid}`}
        disabled={pending}
      >
        <h2>{t("addUser")}</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("name")}</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder={t("name")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              placeholder={t("email")}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
            checked={formData.valid}
            onChange={(e) =>
              setFormData({ ...formData, valid: e.target.checked })
            }
            disabled={pending}
          />
          {t("valid")}
        </label>
      </Form>
    </main>
  );
}
