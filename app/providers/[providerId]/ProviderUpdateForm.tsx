"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { updateProvider } from "@/app/_client/firestore";
import { Provider } from "@/app/_types/Provider";
import { useI18n } from "@/app/_i18n/context";
import SvgRemove from "@/app/_components/SvgRemove";
import SvgAdd from "@/app/_components/SvgAdd";
import SvgSync from "@/app/_components/SvgSync";

export default function ProviderUpdateForm({
  initialData,
}: {
  initialData: Provider;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState<Provider>(initialData);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateProvider(formData);

    if (E.isLeft(result)) {
      setError(t(result.left));
      setPending(false);
    } else {
      setPending(false);
      router.push("/");
    }
  };

  const addParam = () => {
    setFormData({
      ...formData,
      params: [...formData.params, { key: "", value: "" }],
    });
  };

  const updateParam = (index: number, value: string) => {
    const newParams = [...formData.params];
    newParams[index].key = value;
    newParams[index].value = "";
    setFormData({ ...formData, params: newParams });
  };

  const removeParam = (index: number) => {
    setFormData({
      ...formData,
      params: formData.params.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {formData.params.map((param, index) => (
        <div className="row" key={index}>
          <div className="textfield outlined" style={{ flexGrow: 1 }}>
            <label>
              {t("parameters")} {index + 1}
            </label>
            <input
              type="text"
              placeholder={`${t("parameters")} ${index + 1}`}
              value={param.key}
              onChange={(e) => updateParam(index, e.target.value)}
              disabled={pending}
            />
          </div>
          <button
            type="button"
            onClick={() => removeParam(index)}
            disabled={pending}
            className="button icon error"
          >
            <SvgRemove />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addParam}
        disabled={pending}
        className="button tonal"
      >
        <SvgAdd /> {t("addParameter")}
      </button>

      <div className="row">
        <input
          id="valid"
          type="checkbox"
          className="switch"
          checked={formData.valid}
          onChange={(e) =>
            setFormData({ ...formData, valid: e.target.checked })
          }
        />
        {t("valid")}
      </div>

      <hr />
      <div className="error">{error}</div>
      <div className="row right">
        <Link href="/" className="button outlined">
          {t("cancel")}
        </Link>
        <button type="submit" disabled={pending} className="button filled">
          <SvgSync /> {t("save")}
        </button>
      </div>
    </form>
  );
}
