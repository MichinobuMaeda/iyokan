"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { changeEmail, useRequireAuth } from "@/app/_client/auth";
import { validateEmail } from "@/app/_lib/validators";
import { useI18n } from "@/app/_i18n/context";
import PasswordInput from "@/app/_components/PasswordInput";
import SvgSync from "@/app/_components/SvgSync";

export default function ChangeEmailPage() {
  useRequireAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    currentPassword: string;
    newEmail: string;
    confirmEmail: string;
  }>({
    currentPassword: "",
    newEmail: "",
    confirmEmail: "",
  });

  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorCurrentPassword = (() => {
    if (
      !formData.currentPassword ||
      formData.currentPassword.trim().length === 0
    ) {
      return t("required");
    }
    return undefined;
  })();

  const errorNewEmail = (() => {
    if (!formData.newEmail || formData.newEmail.trim().length === 0) {
      return t("required");
    }
    const validationResult = validateEmail(formData.newEmail);
    if (E.isLeft(validationResult)) {
      return t(validationResult.left);
    }
    return undefined;
  })();

  const errorConfirmEmail = (() => {
    if (formData.confirmEmail !== formData.newEmail) {
      return t("errorEmailMismatch");
    }
    return undefined;
  })();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    if (formData.newEmail !== formData.confirmEmail) {
      setErrorOnSave(t("errorEmailMismatch"));
      setPending(false);
      return;
    }

    const result = await changeEmail(formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      router.push("/");
    }
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>{t("changeEmailTitle")}</h2>

        <div className="row">
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            label={t("currentPassword")}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            disabled={pending}
            error={errorCurrentPassword}
            helperText={t("required")}
            required
          />
        </div>

        <div className="row">
          <div
            className={`textfield outlined${errorNewEmail ? " error" : ""}`}
            style={{ width: "100%" }}
          >
            <label>{t("newEmail")}</label>
            <input
              id="newEmail"
              name="newEmail"
              type="email"
              value={formData.newEmail}
              onChange={(e) =>
                setFormData({ ...formData, newEmail: e.target.value })
              }
              required
              placeholder={t("newEmail")}
              disabled={pending}
              style={{ fontFamily: "monospace" }}
            />
            <div>{errorNewEmail || t("required")}</div>
          </div>
        </div>

        <div className="row">
          <div
            className={`textfield outlined${errorConfirmEmail ? " error" : ""}`}
            style={{ width: "100%" }}
          >
            <label>{t("confirmEmail")}</label>
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              value={formData.confirmEmail}
              onChange={(e) =>
                setFormData({ ...formData, confirmEmail: e.target.value })
              }
              required
              placeholder={t("confirmEmail")}
              disabled={pending}
              style={{ fontFamily: "monospace" }}
            />
            <div>{errorConfirmEmail || t("required")}</div>
          </div>
        </div>

        {errorOnSave && (
          <div className="row" style={{ color: "red" }}>
            {errorOnSave}
          </div>
        )}

        <div className="row right">
          <Link href="/" className="button outlined">
            {t("cancel")}
          </Link>
          <button
            type="submit"
            className="button filled"
            disabled={
              pending ||
              !!errorCurrentPassword ||
              !!errorNewEmail ||
              !!errorConfirmEmail
            }
          >
            <SvgSync /> {t("save")}
          </button>
        </div>
      </form>
    </main>
  );
}
