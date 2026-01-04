"use client";

import { useState } from "react";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { useClientAuth } from "@/app/_client/auth";
import { saveProvider } from "@/app/_client/firestore";
import { ProviderData } from "@/app/_types/Provider";
import { useI18n } from "@/app/_i18n/context";
import SvgRemove from "@/app/_icons/SvgRemove";
import SvgAdd from "@/app/_icons/SvgAdd";
import SvgSync from "@/app/_icons/SvgSync";

export default function CreateProviderPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<ProviderData>({
    type: "",
    name: "",
    valid: true,
    params: [],
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();
  const { router } = useClientAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);

    if (!formData.type) {
      setErrorOnSave(t("errorProviderTypeRequired"));
      setPending(false);
      return;
    }

    const result = await saveProvider(formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
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
    setFormData({
      ...formData,
      params: newParams,
    });
  };

  const removeParam = (index: number) => {
    setFormData({
      ...formData,
      params: formData.params.filter((_, i) => i !== index),
    });
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>{t("addProvider")}</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>{t("type")}</label>
            <input
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              placeholder={t("type")}
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {formData.params.map((param, index) => (
          <div key={index} className="row">
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
                style={{ flex: 1 }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeParam(index)}
              disabled={pending}
              className="button icon error sm"
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

        <label className="row">
          <input
            id="valid"
            name="valid"
            checked={formData.valid}
            onChange={(e) =>
              setFormData({ ...formData, valid: e.target.checked })
            }
            className="switch"
            type="checkbox"
            disabled={pending}
            defaultChecked
          />
          {t("valid")}
        </label>

        <hr />
        {errorOnSave && <div className="message error">{errorOnSave}</div>}
        <div className="row right">
          <Link href="/" className="button outlined">
            {t("cancel")}
          </Link>
          <button type="submit" disabled={pending} className="button filled">
            <SvgSync /> {t("save")}
          </button>
        </div>
      </form>
    </main>
  );
}
