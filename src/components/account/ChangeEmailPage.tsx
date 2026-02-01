import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField } from "glassine-paper";

import { dataStateAtom } from "../../lib/store";
import { changeEmail, type ChangeEmailData } from "../../lib/auth";
import { validateRequiredEmail } from "../../lib/validators";
import Form from "../layout/Form";
import PasswordInput from "../layout/PasswordInput";
import SvgAlternateEmail from "../../icons/SvgAlternateEmail";

export default function ChangeEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dataState] = useAtom(dataStateAtom);
  const returnPath = () => `/o/${dataState?.oid}`;

  const [formData, setFormData] = useState<ChangeEmailData>({
    password: "",
    newEmail: "",
    confirmation: "",
  });
  const errorPassword = () => (!formData.password ? t("required") : undefined);
  const errorNewEmail = () => {
    const result = validateRequiredEmail(formData.newEmail);
    return E.isLeft(result) ? t(result.left) : undefined;
  };
  const errorConfirmation = () => {
    return formData.newEmail !== formData.confirmation
      ? t("emailMismatch")
      : undefined;
  };
  const [errorOnSave, setErrorOnSave] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    const result = await changeEmail(formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      console.info("Successfully changed email");
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
          !!errorNewEmail() ||
          !!errorConfirmation()
        }
      >
        <h2>
          <SvgAlternateEmail /> {t("changeEmail")}
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
        <div className="row">
          <TextField
            name="newEmail"
            label={t("newEmail")}
            type="email"
            value={formData.newEmail}
            onChange={(e) =>
              setFormData({ ...formData, newEmail: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorNewEmail()}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="confirmation"
            label={t("confirmEmail")}
            type="email"
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
