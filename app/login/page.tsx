"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { login, LoginData } from "@/app/_client/auth";
import { useRedirectIfAuthenticated } from "@/app/_client/auth";
import { useI18n } from "@/app/_i18n/context";

export default function LoginPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useRedirectIfAuthenticated(pending);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const result = await login(formData);

    if (E.isLeft(result)) {
      setError(t(result.left));
      setPending(false);
    } else {
      console.info("Login success");
      setPending(false);
    }
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>{t("loginTitle")}</h2>
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
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("password")}</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder={t("password")}
              disabled={pending}
            />
          </div>
        </div>
        {error && <div className="message error">{error}</div>}
        <div className="row">
          <Link href="/reset-password">{t("forgotPassword")}</Link>
        </div>
        <button type="submit" className="button filled" disabled={pending}>
          {pending ? t("loggingIn") : t("login")}
        </button>
      </form>
    </main>
  );
}
