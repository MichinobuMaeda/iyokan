import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import type { CreateUserData } from "../../../functions/src/common";
import { createUser } from "../../lib/functions";
import { validateRequiredEmail } from "../../lib/validators";
import SvgPerson from "../../icons/SvgPerson";
import Form from "../layout/Form";

export default function NewUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const oid = params.orgId!;

  const [formData, setFormData] = useState<CreateUserData>({
    oid: oid,
    name: "",
    email: "",
    valid: true,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorName = () => (!formData.name ? t("required") : undefined);

  const errorEmail = () => {
    const result = validateRequiredEmail(formData.email);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);
    const result = await createUser(formData);
    setPending(false);
    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
    } else {
      navigate(`/o/${oid}/users`);
    }
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        errorOnSave={errorOnSave}
        returnPath={`/o/${oid}/users`}
        disabled={pending || !!errorName() || !!errorEmail()}
      >
        <h2>
          <SvgPerson /> {t("addUser")}
        </h2>
        <div className="row">
          <TextField
            name="name"
            type="text"
            label={t("name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            supportingText={t("required")}
            errorMessage={errorName()}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="email"
            type="email"
            label={t("email")}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            supportingText={t("enterValidEmail")}
            errorMessage={errorEmail()}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="valid"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
            disabled={pending}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
