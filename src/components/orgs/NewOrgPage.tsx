import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import { createOrg } from "../../lib/functions";
import type { CreateOrgData } from "../../../functions/src/common";
import { validateOid } from "../../lib/validators";
import SvgDomain from "../../icons/SvgDomain";
import Form from "../layout/Form";

export default function NewOrgPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateOrgData>({
    oid: "",
    name: "",
    desc: "",
    valid: true,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorOid = () => {
    const result = validateOid(formData.oid);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  const errorName = () => (!formData.name ? t("required") : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);
    const result = await createOrg(formData);
    setPending(false);
    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
    } else {
      navigate("/o");
    }
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        errorOnSave={errorOnSave}
        returnPath="/"
        disabled={pending || !!errorOid() || !!errorName()}
      >
        <h2>
          <SvgDomain /> {t("addOrganization")}
        </h2>
        <div className="row">
          <TextField
            name="oid"
            type="text"
            label={t("id")}
            value={formData.oid}
            onChange={(e) =>
              setFormData({ ...formData, oid: e.target.value.toLowerCase() })
            }
            supportingText={t("errorOidInvalidFormat")}
            errorMessage={errorOid()}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
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
            name="desc"
            label={t("description")}
            value={formData.desc}
            lineCount={5}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="valid"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
