import { DocumentSnapshot } from "firebase/firestore";
import { Meta } from "./Meta";

export interface ProviderParam {
  key: string;
  value: string;
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

  return {
    id: doc.id,
    type: data?.type ?? "",
    name: data?.name ?? "",
    params: data?.params ?? [],
    valid: data?.valid ?? false,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
