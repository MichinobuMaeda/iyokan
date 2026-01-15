"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { changeEmail, ChangeEmailData } from "@/app/_client/auth";
import { validateRequiredEmail } from "@/app/_lib/validators";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";
import PasswordInput from "@/app/_components/PasswordInput";

export default function ChangeEmailPage() {
  useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState<ChangeEmailData>({
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
    const validationResult = validateRequiredEmail(formData.newEmail);
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
      <Form
        onSubmit={handleSubmit}
        returnPath="/"
        disabled={
          pending ||
          !!errorCurrentPassword ||
          !!errorNewEmail ||
          !!errorConfirmEmail
        }
        errorOnSave={errorOnSave}
      >
        <h2>{t("changeEmailTitle")}</h2>

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
      </Form>
    </main>
  );
}
