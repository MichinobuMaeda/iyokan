import { useState } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { TextField } from "glassine-paper";

import { login, type LoginData } from "../../lib/auth";
import Form from "../../components/Form";
import PasswordInput from "../../components/PasswordInput";
import SvgLogin from "../../icons/SvgLogin";

export default function LoginPage() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const onSubmit = async () => {
    const email = formData.email.trim();
    const password = formData.password;
    setFormData({ email: "", password: "" });
    return await login({ email, password });
  };

  return (
    <main>
      <Form
        onSubmit={onSubmit}
        returnPath="/"
        validated={!!formData.email && !!formData.password}
        submitLabel="send"
        successMessage={t("loginSuccess")}
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
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <NavLink to="/reset-password">{t("forgotPassword")}</NavLink>
        </div>
      </Form>
    </main>
  );
}
