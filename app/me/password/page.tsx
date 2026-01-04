"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { changePassword, useRequireAuth } from "@/app/_client/auth";
import { validatePassword } from "@/app/_lib/validators";
import { useI18n } from "@/app/_i18n/context";
import PasswordInput from "@/app/_components/PasswordInput";
import SvgSync from "@/app/_components/SvgSync";

export default function ChangePasswordPage() {
  useRequireAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>(undefined);

  const errorCurrentPassword = (() => {
    if (
      !formData.currentPassword ||
      formData.currentPassword.trim().length === 0
    ) {
      return t("required");
    }
    return undefined;
  })();

  const errorNewPassword = (() => {
    if (!formData.newPassword || formData.newPassword.trim().length === 0) {
      return t("required");
    }
    const validationResult = validatePassword(formData.newPassword);
    if (E.isLeft(validationResult)) {
      return t(validationResult.left);
    }
    return undefined;
  })();

  const errorConfirmPassword = (() => {
    if (formData.confirmPassword !== formData.newPassword) {
      return t("errorPasswordMismatch");
    }
    return undefined;
  })();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    const result = await changePassword(formData);

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
        <h2>{t("changePasswordTitle")}</h2>

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
          <PasswordInput
            id="newPassword"
            name="newPassword"
            label={t("newPassword")}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            disabled={pending}
            error={errorNewPassword}
            helperText={t("required")}
            required
          />
        </div>

        <div className="row">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label={t("confirmPassword")}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            disabled={pending}
            error={errorConfirmPassword}
            helperText={t("required")}
            required
          />
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
              !!errorNewPassword ||
              !!errorConfirmPassword
            }
          >
            <SvgSync /> {t("save")}
          </button>
        </div>
      </form>
    </main>
  );
}
