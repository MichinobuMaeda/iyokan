import { DocumentSnapshot } from "firebase/firestore";

import { providerTypes } from "../../functions/src/common";
import type { Meta } from "./Meta";

export interface ProviderParam {
  key: string;
  value: string | number;
}

export interface ProviderData {
  type: string;
  name: string;
  params: ProviderParam[];
  valid: boolean;
}

export interface Provider extends Meta, ProviderData {
  id: string;
  type: string;
  name: string;
  params: ProviderParam[];
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a Provider object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Provider object or null if document doesn't exist
 */
export function providerFromDoc(doc: DocumentSnapshot): Provider | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();
  const id = doc.id;
  const name = data?.name ?? "";
  const type = data?.type ?? "";
  const valid = data?.valid ?? false;
  const createdAt = data?.createdAt?.toDate();
  const updatedAt = data?.updatedAt?.toDate();
  const params = data?.params ?? [];

  const providerType = providerTypes.find((pt) => pt.type === type);

  if (!providerType) {
    return null;
  }

  providerType.params.forEach((paramDef) => {
    if (!params.find((p: ProviderParam) => p.key === paramDef.key)) {
      params.push({
        key: paramDef.key,
        value: paramDef.type === "number" ? 0 : "",
      });
    } else {
      const existingParam = params.find(
        (p: ProviderParam) => p.key === paramDef.key
      );
      if (paramDef.type === "number") {
        existingParam.value = Number(existingParam.value || 0);
      } else {
        existingParam.value = String(existingParam.value || "");
      }
    }
  });

  return {
    id,
    name,
    type,
    params,
    valid,
    createdAt,
    updatedAt,
  };
}
