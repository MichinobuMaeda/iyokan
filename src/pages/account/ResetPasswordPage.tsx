import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextField } from "glassine-paper";

import { resetPassword, type ResetPasswordData } from "../../lib/auth";
import Form from "../../components/Form";
import SvgPassword from "../../icons/SvgPassword";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ResetPasswordData>({ email: "" });

  return (
    <main>
      <Form
        onSubmit={() => resetPassword(formData)}
        returnPath="/login"
        validated={!!formData.email}
        submitLabel="send"
        successMessage={t("passwordResetEmailSent")}
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
            style={{ width: "100%" }}
          />
        </div>
      </Form>
    </main>
  );
}
