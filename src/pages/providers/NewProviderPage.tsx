import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { Button, TextField, Switch } from "glassine-paper";

import { providerTypes } from "../../../functions/src/common";
import { providersAtom } from "../../lib/store";
import { type ProviderData, type ProviderParam } from "../../types/Provider";
import { createOrgProvider } from "../../lib/firestore";
import SvgAppRegistration from "../../icons/SvgAppRegistration";
import Form from "../../components/Form";

export default function NewProviderPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [providers] = useAtom(providersAtom);
  const [pt, setPt] = useState(
    providerTypes.filter(
      (pt) => !providers?.some((p) => p.type === pt.type)
    )[0] ?? providerTypes[0]
  );
  const [formData, setFormData] = useState<ProviderData>({
    type: pt.type,
    name: pt.defaultName,
    params: pt.params.map(
      (param) =>
        ({
          key: param.key,
          value: "",
        }) as ProviderParam
    ),
    valid: true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  const onSelectType = (type: string) => {
    const pt = providerTypes.find((pt) => pt.type === type)!;
    setPt(pt);
    setFormData({
      ...formData,
      type: pt.type,
      name: pt.defaultName,
      params: pt.params.map(
        (param) =>
          ({
            key: param.key,
            value: "",
          }) as ProviderParam
      ),
    });
  };

  return (
    <main>
      <Form
        onSubmit={() => createOrgProvider(oid, formData)}
        returnPath={`/o/${oid}/providers`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <SvgAppRegistration /> {t("addProvider")}
        </h2>
        <div className="button-group">
          {providerTypes.map((pt) => (
            <Button
              key={pt.type}
              type="select"
              label={pt.defaultName}
              checked={formData.type === pt.type}
              size="sm"
              onClick={() => onSelectType(pt.type)}
            />
          ))}
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
        {formData.params
          .filter(
            (p) => pt.params.find((ptp) => ptp.key === p.key)?.source === "user"
          )
          .map((param, index) => (
            <div className="row" key={param.key}>
              <TextField
                name={param.key}
                type="text"
                label={param.key}
                value={param.value}
                onChange={(e) => {
                  const newParams = [...formData.params];
                  newParams[index].value = e.target.value;
                  setFormData({ ...formData, params: newParams });
                }}
                style={{ width: "100%" }}
              />
            </div>
          ))}
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
