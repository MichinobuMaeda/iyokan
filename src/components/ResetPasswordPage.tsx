"use client";

import { useState, type FormEvent } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";

import { resetPassword, type ResetPasswordData } from "../lib/auth";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ResetPasswordData>({ email: "" });
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();

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
          <NavLink to="/login" className="button outlined">
            {t("cancel")}
          </NavLink>
          <button type="submit" className="button filled" disabled={pending}>
            {pending ? t("sending") : t("sendResetEmail")}
          </button>
        </div>
      </form>
    </main>
  );
}
