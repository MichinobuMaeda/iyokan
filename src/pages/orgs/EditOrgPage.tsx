import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch } from "glassine-paper";

import { orgsAtom } from "../../lib/store";
import { updateOrg } from "../../lib/firestore";
import { type Org } from "../../types/Org";
import Form from "../../components/Form";
import SvgDomain from "../../icons/SvgDomain";

export default function EditOrgPage() {
  const { t } = useTranslation();
  const params = useParams();
  const [orgs] = useAtom(orgsAtom);
  const org = orgs?.find((o) => o.id === params.oid);

  if (!org) {
    throw redirect(`/o/${params.oid}`);
  }

  const [formData, setFormData] = useState<Org>({
    id: org!.id || "",
    name: org!.name || "",
    desc: org!.desc || "",
    hardBreak: !!org!.hardBreak,
    valid: org!.valid ?? true,
    createdAt: org!.createdAt,
    updatedAt: org!.updatedAt,
  });

  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => updateOrg(formData)}
        returnPath={`/o/${org!.id}`}
        returnOnSubmit
        validated={!errorName()}
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
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="hardBreak"
            value="on"
            checked={formData.hardBreak}
            onClick={() =>
              setFormData({ ...formData, hardBreak: !formData.hardBreak })
            }
          />
          {t("hardBreak")}
        </label>
        <label className="row">
          <Switch
            name="valid"
            value="on"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
            disabled={org.id === "sys"}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
