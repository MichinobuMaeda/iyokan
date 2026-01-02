"use client";

import { useState } from "react";
import { useClientAuth } from "@/app/_client/auth";
import { saveProvider } from "@/app/_client/firestore";
import { ProviderParam } from "@/app/_types/Provider";
import Link from "next/link";
import * as E from "fp-ts/Either";

import SvgRemove from "../_components/SvgRemove";
import SvgAdd from "../_components/SvgAdd";
import SvgSync from "../_components/SvgSync";

export default function CreateProviderPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { router } = useClientAuth();
  const [params, setParams] = useState<ProviderParam[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const type = String(formData.get("type") || "").trim();
    const valid = formData.get("valid") === "on";

    if (!type) {
      setError("Provider type is required");
      setPending(false);
      return;
    }

    const result = await saveProvider(type, {
      type,
      name: type,
      params,
      valid,
    });

    if (E.isLeft(result)) {
      setError(result.left.message);
      setPending(false);
    } else {
      router.push("/");
    }
  };

  const addParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  const updateParam = (index: number, value: string) => {
    const newParams = [...params];
    newParams[index].key = value;
    newParams[index].value = "";
    setParams(newParams);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  return (
    <main>
      <form className="column" onSubmit={handleSubmit}>
        <h2>Add Provider</h2>
        <div className="row">
          <div className="textfield outlined" style={{ width: "100%" }}>
            <label>Type</label>
            <input
              id="type"
              name="type"
              type="text"
              placeholder="Type"
              required
              disabled={pending}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {params.map((param, index) => (
          <div key={index} className="row">
            <div className="textfield outlined" style={{ flexGrow: 1 }}>
              <label>Parameter {index + 1}</label>
              <input
                type="text"
                placeholder={`Parameter ${index + 1}`}
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
          <SvgAdd /> Add Parameter
        </button>

        <label className="row">
          <input
            id="valid"
            name="valid"
            className="switch"
            type="checkbox"
            disabled={pending}
            defaultChecked
          />
          Valid
        </label>

        <hr />
        <div className="error">{error}</div>
        <div className="row right">
          <Link href="/" className="button outlined">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="button filled">
            <SvgSync /> Save
          </button>
        </div>
      </form>
    </main>
  );
}
