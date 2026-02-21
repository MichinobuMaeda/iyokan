import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch } from "glassine-paper";

import { providerTypes } from "../../../functions/src/common";
import { providersAtom } from "../../lib/store";
import { updateOrgProvider } from "../../lib/firestore";
import { type ProviderData } from "../../types/Provider";
import ProviderIcons from "../../components/ProviderIcons";
import MetaItems from "../../components/MetaItems";
import Form from "../../components/Form";

export default function EditProviderPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [providers] = useAtom(providersAtom);
  const provider = () => providers?.find((p) => p.id === params.providerId);
  const pt = providerTypes.find((pt) => pt.type === provider()?.type);

  if (!provider() || !pt) {
    throw redirect(`/o/${oid}/providers`);
  }

  const [formData, setFormData] = useState<ProviderData>({
    type: provider()!.type,
    name: provider()!.name || "",
    params: provider()!.params || [],
    valid: provider()!.valid ?? true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => updateOrgProvider(oid, provider()!.id, formData)}
        returnPath={`/o/${oid}/providers/${provider()!.id}`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <ProviderIcons type={formData.type} /> {t("editProvider")}
        </h2>
        <MetaItems meta={provider()!} />
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
        {formData.params.map((param, index) => (
          <div className="row" key={param.key}>
            {pt.params.find((p) => p.key === param.key)?.source === "user" ? (
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
            ) : (
              <>
                {param.key}: {param.value}
              </>
            )}
          </div>
        ))}
        <label className="row">
          <Switch
            name="valid"
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
