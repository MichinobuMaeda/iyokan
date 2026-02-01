import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { TextField } from "glassine-paper";

import { resetPassword, type ResetPasswordData } from "../../lib/auth";
import Form from "../layout/Form";
import SvgPassword from "../../icons/SvgPassword";

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
      <Form
        onSubmit={handleSubmit}
        returnPath="/login"
        disabled={pending || !formData.email}
      >
        <h2>
          <SvgPassword />
          {t("resetPasswordTitle")}
        </h2>
        <div>{t("validPassword")}</div>
        <div className="row">
          <TextField
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

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
      </Form>
    </main>
  );
}
