import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import { confAtom } from "../../lib/store";
import { updateConf } from "../../lib/firestore";
import { type ConfData } from "../../types/Conf";
import { validateRequiredUrl } from "../../lib/validators";
import Form from "../../components/Form";
import SvgSettingsApplications from "../../icons/SvgSettingsApplications";

export default function EditConfPage() {
  const { t } = useTranslation();
  const [conf] = useAtom(confAtom);

  const [formData, setFormData] = useState<ConfData>({
    webUrl: conf!.webUrl || "",
    desc: conf!.desc || "",
    hardBreak: conf!.hardBreak ?? false,
  });

  const errorWebUrl = () => {
    const result = validateRequiredUrl(formData.webUrl);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  return (
    <main>
      <Form
        onSubmit={() => updateConf(formData)}
        returnPath="/"
        returnOnSubmit
        validated={!errorWebUrl()}
      >
        <h2>
          <SvgSettingsApplications /> {t("appSettings")}
        </h2>
        <div className="row">
          <TextField
            name="webUrl"
            type="url"
            label={t("url")}
            value={formData.webUrl}
            onChange={(e) =>
              setFormData({ ...formData, webUrl: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorWebUrl()}
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
      </Form>
    </main>
  );
}
