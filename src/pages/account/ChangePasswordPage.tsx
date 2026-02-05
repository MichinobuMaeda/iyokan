import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";

import { dataStateAtom } from "../../lib/store";
import { changePassword, type ChangePasswordData } from "../../lib/auth";
import { validatePassword } from "../../lib/validators";
import Form from "../../components/Form";
import PasswordInput from "../../components/PasswordInput";
import SvgPassword from "../../icons/SvgPassword";

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const [dataState] = useAtom(dataStateAtom);
  const [formData, setFormData] = useState<ChangePasswordData>({
    password: "",
    newPassword: "",
    confirmation: "",
  });
  const errorPassword = () => (!formData.password ? t("required") : undefined);
  const errorNewPassword = () => {
    const result = validatePassword(formData.newPassword);
    return E.isLeft(result) ? t(result.left) : undefined;
  };
  const errorConfirmation = () => {
    return formData.newPassword !== formData.confirmation
      ? t("passwordMismatch")
      : undefined;
  };

  return (
    <main>
      <Form
        onSubmit={() => changePassword(formData)}
        returnPath={`/o/${dataState?.oid}`}
        validated={
          !errorPassword() && !errorNewPassword() && !errorConfirmation()
        }
      >
        <h2>
          <SvgPassword /> {t("changePassword")}
        </h2>
        <div className="row">
          <PasswordInput
            name="password"
            label={t("password")}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorPassword()}
            style={{ width: "100%" }}
          />
        </div>
        <div>{t("validPassword")}</div>
        <div className="row">
          <PasswordInput
            name="newPassword"
            label={t("newPassword")}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorNewPassword()}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <PasswordInput
            name="confirmation"
            label={t("confirmPassword")}
            value={formData.confirmation}
            onChange={(e) =>
              setFormData({ ...formData, confirmation: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorConfirmation()}
            style={{ width: "100%" }}
          />
        </div>
      </Form>
    </main>
  );
}
