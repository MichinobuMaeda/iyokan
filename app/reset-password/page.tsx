"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { resetPassword, ResetPasswordData } from "@/app/_client/auth";
import { useRedirectIfAuthenticated } from "@/app/_client/auth";
import { useI18n } from "@/app/_i18n/context";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ResetPasswordData>({ email: "" });
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();

  useRedirectIfAuthenticated();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setPending(true);

    const result = await resetPassword(formData);

    if (E.isLeft(result)) {
      setError(t(result.left));
    } else {
      setSuccess(t("passwordResetEmailSent"));
    }

    setPending(false);
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>{t("resetPasswordTitle")}</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("email")}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder={t("email")}
              disabled={pending}
            />
          </div>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
        <div className="row right">
          <Link href="/login" className="button outlined">
            {t("cancel")}
          </Link>
          <button type="submit" className="button filled" disabled={pending}>
            {pending ? t("sending") : t("sendResetEmail")}
          </button>
        </div>
      </form>
    </main>
  );
}
