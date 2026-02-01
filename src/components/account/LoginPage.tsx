import { useState, type FormEvent } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { TextField } from "glassine-paper";

import { login, type LoginData } from "../../lib/auth";
import Form from "../layout/Form";
import PasswordInput from "../layout/PasswordInput";
import SvgLogin from "../../icons/SvgLogin";

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
      <Form
        onSubmit={handleSubmit}
        returnPath="/"
        disabled={pending || !formData.email || !formData.password}
      >
        <h2>
          <SvgLogin /> {t("loginTitle")}
        </h2>
        <div className="row">
          <TextField
            name="email"
            label={t("email")}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <PasswordInput
            name="password"
            label={t("password")}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        {error && <div className="message error">{error}</div>}
        <div className="row">
          <NavLink to="/reset-password">{t("forgotPassword")}</NavLink>
        </div>
      </Form>
    </main>
  );
}
