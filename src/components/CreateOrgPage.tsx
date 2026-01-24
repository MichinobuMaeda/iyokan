import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";

import { createOrg } from "../lib/functions";
import { type OrgData } from "../types/Org";
import { validateOid } from "../lib/validators";
import Form from "./Form";

export default function CreateOrgPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{ oid: string } & OrgData>({
    oid: "",
    name: "",
    desc: "",
    valid: true,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorOid = () => {
    const result = validateOid(formData.oid);
    return E.isLeft(result) && result.left;
  };

  const errorName = () => !formData.name && "required";

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
        <h2>{t("addOrganization")}</h2>
        <div className="row">
          <div
            className={`textfield outlined ${errorOid() ? "error" : ""}`}
            style={{ width: "100%" }}
          >
            <label>{t("id")}</label>
            <input
              id="oid"
              name="oid"
              type="text"
              value={formData.oid}
              onChange={(e) =>
                setFormData({ ...formData, oid: e.target.value.toLowerCase() })
              }
              placeholder={t("id")}
              pattern="[a-z0-9]+"
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
            <div>{t(errorOid() || "required")}</div>
          </div>
        </div>
        <div className="row">
          <div
            className={`textfield outlined ${errorName() ? "error" : ""}`}
            style={{ width: "100%" }}
          >
            <label>{t("name")}</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("name")}
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
            <div>{t(errorName() || "required")}</div>
          </div>
        </div>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("description")}</label>
            <textarea
              id="desc"
              name="desc"
              value={formData.desc}
              onChange={(e) =>
                setFormData({ ...formData, desc: e.target.value })
              }
              placeholder={t("description")}
              disabled={pending}
              style={{ width: "100%" }}
              rows={3}
            />
          </div>
        </div>
        <label className="row">
          <input
            id="valid"
            name="valid"
            className="switch"
            type="checkbox"
            disabled={pending}
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
