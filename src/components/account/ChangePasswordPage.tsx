import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";

import { dataStateAtom } from "../../lib/store";
import { changePassword, type ChangePasswordData } from "../../lib/auth";
import { validatePassword } from "../../lib/validators";
import Form from "../layout/Form";
import PasswordInput from "../layout/PasswordInput";
import SvgPassword from "../../icons/SvgPassword";

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dataState] = useAtom(dataStateAtom);
  const returnPath = () => `/o/${dataState?.oid}`;

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
  const [errorOnSave, setErrorOnSave] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    const result = await changePassword(formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      console.info("Successfully changed password");
      setPending(false);
      navigate(returnPath());
    }
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        returnPath={returnPath()}
        disabled={
          pending ||
          !!errorPassword() ||
          !!errorNewPassword() ||
          !!errorConfirmation()
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
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <div>{t("validPassword")}</div>
        <div className="row">
          <PasswordInput
            name="newEmail"
            label={t("newPassword")}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorNewPassword()}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <PasswordInput
            name="confirmation"
            label={t("confirmEmail")}
            value={formData.confirmation}
            onChange={(e) =>
              setFormData({ ...formData, confirmation: e.target.value })
            }
            disabled={pending}
            supportingText={t("required")}
            errorMessage={errorConfirmation()}
            style={{ width: "100%" }}
          />
        </div>
        {errorOnSave && <div className="message error">{errorOnSave}</div>}
      </Form>
    </main>
  );
}
