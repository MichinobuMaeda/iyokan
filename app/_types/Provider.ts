import { DocumentSnapshot } from "firebase/firestore";
import { Meta } from "./Meta";

export interface ProviderParamDefinition {
  key: string;
  type: string;
  source: "user" | "api";
}

export interface ProviderType {
  type: string;
  defaultName: string;
  params: ProviderParamDefinition[];
}

export const providerTypes: Array<ProviderType> = [
  {
    type: "bluesky",
    defaultName: "Bluesky",
    params: [
      { key: "service", type: "string", source: "user" },
      { key: "identifier", type: "string", source: "user" },
      { key: "password", type: "string", source: "user" },
    ],
  },
  {
    type: "mastodon",
    defaultName: "Mastodon",
    params: [
      { key: "token", type: "string", source: "user" },
      { key: "url", type: "string", source: "user" },
    ],
  },
  {
    type: "misskey",
    defaultName: "Misskey",
    params: [
      { key: "token", type: "string", source: "user" },
      { key: "url", type: "string", source: "user" },
    ],
  },
  {
    type: "twitter",
    defaultName: "Twitter",
    params: [
      { key: "redirect_uri", type: "string", source: "user" },
      { key: "client_id", type: "string", source: "user" },
      { key: "client_secret", type: "string", source: "user" },
      { key: "code_verifier", type: "string", source: "api" },
      { key: "code", type: "string", source: "api" },
      { key: "access_token", type: "string", source: "api" },
      { key: "refresh_token", type: "string", source: "api" },
      { key: "expires_in", type: "number", source: "api" },
    ],
  },
  {
    type: "threads",
    defaultName: "Threads",
    params: [
      { key: "redirect_uri", type: "string", source: "user" },
      { key: "client_id", type: "string", source: "user" },
      { key: "client_secret", type: "string", source: "user" },
      { key: "code", type: "string", source: "api" },
      { key: "access_token", type: "string", source: "api" },
      { key: "user_id", type: "string", source: "api" },
      { key: "expires_in", type: "number", source: "api" },
    ],
  },
  {
    type: "instagram",
    defaultName: "Instagram",
    params: [
      { key: "client_id", type: "string", source: "user" },
      { key: "access_token", type: "string", source: "user" },
      { key: "expires_in", type: "number", source: "api" },
    ],
  },
  {
    type: "tumblr",
    defaultName: "Tumblr",
    params: [
      { key: "redirect_uri", type: "string", source: "user" },
      { key: "client_id", type: "string", source: "user" },
      { key: "client_secret", type: "string", source: "user" },
      { key: "code", type: "string", source: "api" },
      { key: "access_token", type: "string", source: "api" },
      { key: "refresh_token", type: "string", source: "api" },
      { key: "expires_in", type: "number", source: "api" },
    ],
  },
  {
    type: "wordpress",
    defaultName: "WordPress",
    params: [
      { key: "service", type: "string", source: "user" },
      { key: "identifier", type: "string", source: "user" },
      { key: "password", type: "string", source: "user" },
      { key: "category", type: "string", source: "user" },
    ],
  },
];

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
