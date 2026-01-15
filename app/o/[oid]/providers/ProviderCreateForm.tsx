"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as E from "fp-ts/Either";

import {
  providerTypes,
  ProviderType,
  ProviderParam,
} from "@/app/_types/Provider";
import { saveProvider } from "@/app/_client/firestore";
import { useI18n } from "@/app/_i18n/context";
import Form from "@/app/_components/Form";

export default function ProviderCreateForm({ oid }: { oid: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);
  const [name, setName] = useState("");
  const [params, setParams] = useState<ProviderParam[]>([]);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (type: string) => {
    const providerType = providerTypes.find((pt) => pt.type === type);
    if (providerType) {
      setSelectedType(providerType);
      setName(providerType.defaultName);
      // Initialize params with empty strings
      const initialParams: ProviderParam[] = providerType.params
        .filter((paramDef) => paramDef.source === "user")
        .map((paramDef) => ({
          key: paramDef.key,
          value: paramDef.type === "number" ? 0 : "",
        }));
      setParams(initialParams);
    }
  };

  const handleParamChange = (paramKey: string, value: string) => {
    setParams((prev) =>
      prev.map((p) => (p.key === paramKey ? { ...p, value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      setErrorOnSave("Please select a provider type");
      return;
    }

    setLoading(true);
    setErrorOnSave(undefined);

    const providerData = {
      type: selectedType.type,
      name: name.trim(),
      params,
      valid: true,
    };

    const result = await saveProvider(oid, providerData);

    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
      setLoading(false);
      return;
    }

    router.push(`/o/${oid}`);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      errorOnSave={errorOnSave}
      returnPath={`/o/${oid}`}
      disabled={loading}
    >
      <div>
        <label htmlFor="providerType">Provider Type</label>
        <select
          id="providerType"
          value={selectedType?.type ?? ""}
          onChange={(e) => handleTypeChange(e.target.value)}
          required
        >
          <option value="">Select a provider type</option>
          {providerTypes.map((pt) => (
            <option key={pt.type} value={pt.type}>
              {pt.defaultName}
            </option>
          ))}
        </select>
      </div>

      {selectedType && (
        <>
          <div>
            <label htmlFor="name">Provider Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {selectedType.params
            .filter((paramDef) => paramDef.source === "user")
            .map((paramDef) => {
              const param = params.find((p) => p.key === paramDef.key);
              return (
                <div key={paramDef.key}>
                  <label htmlFor={paramDef.key}>
                    {paramDef.key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    type={
                      paramDef.key.includes("password") ? "password" : "text"
                    }
                    id={paramDef.key}
                    value={param?.value || ""}
                    onChange={(e) =>
                      handleParamChange(paramDef.key, e.target.value)
                    }
                    required
                  />
                </div>
              );
            })}
        </>
      )}
    </Form>
  );
}
