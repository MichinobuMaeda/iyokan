"use client";

import { useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { changePassword, ChangePasswordData } from "@/app/_client/auth";
import {
  validatePassword,
  validateRequiredString,
} from "@/app/_lib/validators";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";
import PasswordInput from "@/app/_components/PasswordInput";

export default function ChangePasswordPage() {
  useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>(undefined);

  const errorCurrentPassword = useMemo(() => {
    const validationResult = validateRequiredString(formData.currentPassword);
    if (E.isLeft(validationResult)) {
      return t(validationResult.left);
    }
    return undefined;
  }, [formData.currentPassword, t]);

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
      <Form
        onSubmit={handleSubmit}
        returnPath="/"
        disabled={
          pending ||
          !!errorCurrentPassword ||
          !!errorNewPassword ||
          !!errorConfirmPassword
        }
        errorOnSave={errorOnSave}
      >
        <h2>{t("changePasswordTitle")}</h2>

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
      </Form>
    </main>
  );
}
