import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TextField } from "glassine-paper";

import { sendLoginLink, type SendLoginLinkData } from "../../lib/auth";
import Form from "../../components/Form";

export default function LoginEmailLinkForm() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<SendLoginLinkData>({
    email: "",
  });

  const onSubmit = async () => {
    const email = formData.email.trim();
    setFormData({ email: "" });
    return await sendLoginLink({ email });
  };

  return (
    <Form
      onSubmit={onSubmit}
      returnPath="/"
      validated={!!formData.email.trim()}
      submitLabel="send"
      successMessage={t("sendLoginLinkSuccess")}
    >
      <h3>{t("receiveLoginLink")}</h3>
      <div className="row">
        <TextField
          name="email"
          label={t("email")}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ width: "100%" }}
        />
      </div>
    </Form>
  );
}
