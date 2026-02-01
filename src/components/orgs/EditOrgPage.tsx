import { useState } from "react";
import { useParams, useNavigate, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import { orgsAtom } from "../../lib/store";
import { updateOrg } from "../../lib/firestore";
import { type Org } from "../../types/Org";
import SvgDomain from "../../icons/SvgDomain";
import Form from "../layout/Form";

export default function EditOrgPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [orgs] = useAtom(orgsAtom);
  const org = orgs?.find((o) => o.id === params.orgId);

  if (!org) {
    throw redirect(`/o/${params.orgId}`);
  }

  const [formData, setFormData] = useState<Org>({
    id: org!.id || "",
    name: org!.name || "",
    desc: org!.desc || "",
    valid: org!.valid ?? true,
    createdAt: org!.createdAt,
    updatedAt: org!.updatedAt,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorName = () => (!formData.name ? t("required") : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);
    const result = await updateOrg(formData);
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
        returnPath="/o"
        disabled={pending || !!errorName()}
      >
        <h2>
          <SvgDomain /> {org.id}
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
            disabled={pending || org.id === "sys"}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
