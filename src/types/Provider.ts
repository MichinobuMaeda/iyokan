import { DocumentSnapshot } from "firebase/firestore";

import { providerTypes } from "../../functions/src/common";
import type { Meta } from "./Meta";

export type ProviderType = (typeof providerTypes)[number]["type"];

export interface ProviderParam {
  key: string;
  value: string | number;
}

export interface ProviderData {
  type: ProviderType;
  name: string;
  params: ProviderParam[];
  valid: boolean;
}

export interface Provider extends Meta, ProviderData {
  id: string;
  type: ProviderType;
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

  const id = doc.id;
  const { type, name, valid, createdAt, updatedAt, ...remaining } = doc.data()!;
  const providerType = providerTypes.find((pt) => pt.type === type);
  const params =
    providerType?.params.map(({ key }) => ({
      key,
      value:
        remaining[key] ||
        (providerType.params.find((p) => p.key === key)?.type === "number"
          ? 0
          : ""),
    })) ?? ([] as ProviderParam[]);

  if (!providerType) {
    return null;
  }

  return {
    id,
    type: type as ProviderType,
    name: name || providerType.defaultName,
    params,
    valid: !!valid,
    createdAt: createdAt?.toDate(),
    updatedAt: updatedAt?.toDate(),
  };
}
