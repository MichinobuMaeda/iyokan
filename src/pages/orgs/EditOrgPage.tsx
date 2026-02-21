import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch } from "glassine-paper";
import * as E from "fp-ts/Either";

import { orgsAtom } from "../../lib/store";
import { updateOrg } from "../../lib/firestore";
import {
  timesTextToPresetTimes,
  validateTimesText,
} from "../../lib/validators";
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
    presetTimes: org!.presetTimes || [],
    valid: org!.valid ?? true,
    createdAt: org!.createdAt,
    updatedAt: org!.updatedAt,
  });
  const [timesText, setTimesText] = useState(formData.presetTimes.join("\n"));

  const errorName = () => (!formData.name ? t("required") : undefined);
  const errorTimesText = () => {
    const validation = validateTimesText(timesText);
    return E.isLeft(validation) ? t(validation.left) : undefined;
  };

  return (
    <main>
      <Form
        onSubmit={() =>
          updateOrg({
            ...formData,
            presetTimes: timesTextToPresetTimes(timesText),
          })
        }
        returnPath={`/o/${org!.id}`}
        returnOnSubmit
        validated={!errorName() && !errorTimesText()}
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
            onChange={(e) =>
              setFormData({ ...formData, hardBreak: e.target.checked })
            }
          />
          {t("hardBreak")}
        </label>
        <div className="row">
          <TextField
            name="presetTimes"
            label={t("presetTimes")}
            value={timesText}
            lineCount={5}
            onChange={(e) => setTimesText(e.target.value)}
            supportingText={t("presetTimesFormat")}
            errorMessage={errorTimesText()}
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
            disabled={org.id === "sys"}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
