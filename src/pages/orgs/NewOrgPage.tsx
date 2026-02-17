import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import type { CreateOrgData } from "../../../functions/src/common";
import { orgsAtom } from "../../lib/store";
import { createOrg } from "../../lib/functions";
import { validateOid } from "../../lib/validators";
import SvgDomain from "../../icons/SvgDomain";
import Form from "../../components/Form";

export default function NewOrgPage() {
  const { t } = useTranslation();
  const [orgs] = useAtom(orgsAtom);
  const [formData, setFormData] = useState<CreateOrgData>({
    oid: "",
    name: "",
    desc: "",
    hardBreak: false,
    presetTimes: [],
    valid: true,
  });
  const errorOid = () => {
    const result = validateOid(formData.oid, orgs || []);
    return E.isLeft(result) ? t(result.left) : undefined;
  };
  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => createOrg(formData)}
        returnPath="/o"
        returnOnSubmit
        validated={!errorOid() && !errorName()}
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
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
