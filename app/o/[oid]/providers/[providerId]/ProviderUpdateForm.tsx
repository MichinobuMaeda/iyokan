"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { useAuth } from "@/app/_client/useAuth";
import { updateProvider } from "@/app/_client/firestore";
import { Provider, providerTypes } from "@/app/_types/Provider";
import { useI18n } from "@/app/_i18n/context";
import SvgSync from "@/app/_icons/SvgSync";
import PasswordInput from "@/app/_components/PasswordInput";

export default function ProviderUpdateForm({
  initialData,
}: {
  initialData: Provider;
}) {
  const { t } = useI18n();
  const params = useParams<{ oid: string }>();
  const oid = params?.oid ?? "";
  const [formData, setFormData] = useState<Provider>(initialData);
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | null>(null);
  const { router } = useAuth();

  const selectedType = providerTypes.find((pt) => pt.type === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrorOnSave(null);

    const result = await updateProvider(oid, formData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setPending(false);
    } else {
      setPending(false);
      router.push(`/o/${oid}/providers`);
    }
  };

  const handleParamChange = (key: string, value: string | number) => {
    const updatedParams = formData.params.map((p) =>
      p.key === key ? { ...p, value } : p
    );
    setFormData({ ...formData, params: updatedParams });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="textfield outlined" style={{ width: "100%" }}>
          <label>{t("name")}</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div className="row">
        <div className="textfield outlined" style={{ width: "100%" }}>
          <label>{t("type")}</label>
          <input
            id="type"
            name="type"
            type="text"
            value={formData.type}
            readOnly
            disabled={pending}
            style={{ width: "100%" }}
          />
          <div className="helper-text">{t("typeChangeNote")}</div>
        </div>
      </div>

      {selectedType &&
        selectedType.params
          .filter((p) => p.source === "user")
          .map((paramDef) => {
            const param = formData.params.find(
              (p) => p.key === paramDef.key
            ) || { key: paramDef.key, value: "" };

            const isPasswordField =
              paramDef.key.includes("password") ||
              paramDef.key.includes("secret") ||
              paramDef.key.includes("token");

            return (
              <div className="row" key={paramDef.key}>
                <div className="textfield outlined" style={{ width: "100%" }}>
                  <label>{paramDef.key}</label>
                  {isPasswordField ? (
                    <PasswordInput
                      id={paramDef.key}
                      name={paramDef.key}
                      label={paramDef.key}
                      value={String(param.value)}
                      onChange={(e) =>
                        handleParamChange(paramDef.key, e.target.value)
                      }
                      required
                      disabled={pending}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <input
                      id={paramDef.key}
                      name={paramDef.key}
                      type={paramDef.type === "number" ? "number" : "text"}
                      value={param.value}
                      onChange={(e) =>
                        handleParamChange(
                          paramDef.key,
                          paramDef.type === "number"
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      required
                      disabled={pending}
                      style={{ width: "100%" }}
                    />
                  )}
                </div>
              </div>
            );
          })}

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
      {errorOnSave && <div className="message error">{errorOnSave}</div>}
      <div className="row right">
        <Link href={`/o/${oid}/providers`} className="button outlined">
          {t("cancel")}
        </Link>
        <button type="submit" disabled={pending} className="button filled">
          <SvgSync /> {t("save")}
        </button>
      </div>
    </form>
  );
}
