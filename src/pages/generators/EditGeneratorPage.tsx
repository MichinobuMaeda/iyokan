import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch, Button } from "glassine-paper";

import { generatorsAtom, providersAtom } from "../../lib/store";
import { updateOrgGenerator } from "../../lib/firestore";
import { type GeneratorData } from "../../types/Generator";
import SvgCognition from "../../icons/SvgCognition";
import MetaItems from "../../components/MetaItems";
import Form from "../../components/Form";
import ProviderIcons from "../../components/ProviderIcons";

export default function EditGeneratorPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [generators] = useAtom(generatorsAtom);
  const [providers] = useAtom(providersAtom);
  const generator = () => generators?.find((g) => g.id === params.generatorId);

  if (!generator()) {
    throw redirect(`/o/${oid}/generators`);
  }

  const [formData, setFormData] = useState<GeneratorData>({
    name: generator()!.name || "",
    source: generator()!.source || "",
    prompt: generator()!.prompt || "",
    providers: generator()!.providers || [],
    valid: generator()!.valid ?? true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  const toggleProvider = (providerId: string) => {
    const newProviders = formData.providers.includes(providerId)
      ? formData.providers.filter((p) => p !== providerId)
      : [...formData.providers, providerId];
    setFormData({ ...formData, providers: newProviders });
  };

  return (
    <main>
      <Form
        onSubmit={() => updateOrgGenerator(oid, generator()!.id, formData)}
        returnPath={`/o/${oid}/generators/${generator()!.id}`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <SvgCognition /> {t("editGenerator")}
        </h2>
        <MetaItems meta={generator()!} />
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
            name="source"
            type="text"
            lineCount={6}
            label={t("source")}
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="prompt"
            type="text"
            lineCount={6}
            label={t("prompt")}
            value={formData.prompt}
            onChange={(e) =>
              setFormData({ ...formData, prompt: e.target.value })
            }
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <label>{t("providers")}</label>
        </div>
        <div className="button-group">
          {providers
            ?.filter((p) => p.valid)
            .map((provider) => (
              <Button
                key={provider.id}
                type="select"
                label={provider.name}
                icon={<ProviderIcons type={provider.type} />}
                checked={formData.providers.includes(provider.id)}
                size="sm"
                onClick={() => toggleProvider(provider.id)}
              />
            ))}
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
