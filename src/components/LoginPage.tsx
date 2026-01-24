import { useState, type FormEvent } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";

import { login, type LoginData } from "../lib/auth";

export default function LoginPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

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
          <NavLink to="/reset-password">{t("forgotPassword")}</NavLink>
        </div>
        <div className="row right">
          <NavLink className="button outlined" to="/">
            {t("cancel")}
          </NavLink>
          <button type="submit" className="button filled" disabled={pending}>
            {pending ? t("loggingIn") : t("login")}
          </button>
        </div>
      </form>
    </main>
  );
}
