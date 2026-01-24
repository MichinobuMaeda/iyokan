export const OID_SYSADMIN = "sys";
export const GID_MANAGERS = "managers";
export const GID_ADMINS = "admins";

export type UserPrivileges = {
  [oid: string]: { manager: boolean; admin: boolean };
};

export interface ProviderParamDef {
  key: string;
  type: string;
  source: "user" | "api";
}

export interface ProviderType {
  type: string;
  defaultName: string;
  params: ProviderParamDef[];
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
