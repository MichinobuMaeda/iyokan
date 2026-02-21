import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import type { CreateUserData } from "../../../functions/src/common";
import { createUser } from "../../lib/functions";
import { validateRequiredEmail } from "../../lib/validators";
import SvgPerson from "../../icons/SvgPerson";
import Form from "../../components/Form";

export default function NewUserPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [formData, setFormData] = useState<CreateUserData>({
    oid: oid,
    name: "",
    email: "",
    valid: true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);
  const errorEmail = () => {
    const result = validateRequiredEmail(formData.email);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  return (
    <main>
      <Form
        onSubmit={() => createUser(formData)}
        returnPath={`/o/${oid}/users`}
        returnOnSubmit
        validated={!errorName() && !errorEmail()}
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
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="valid"
            value="on"
            checked={formData.valid}
            onChange={(e) =>
              setFormData({ ...formData, valid: e.target.checked })
            }
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
