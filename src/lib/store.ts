import { atom, type Getter } from "jotai";
import { atomWithStorage } from "jotai/utils";

import {
  type UserPrivileges,
  GID_ADMINS,
  GID_MANAGERS,
  OID_SYSADMIN,
} from "../../functions/src/common";
import { type UserState } from "../types/UserState";
import { type Conf } from "../types/Conf";
import { type Org } from "../types/Org";
import { type User } from "../types/User";
import { type Group } from "../types/Group";
import { type Provider } from "../types/Provider";
import { type Template } from "../types/Template";
import { type Generator } from "../types/Generator";
import { type Post } from "../types/Post";

export const localeAtom = atomWithStorage<string>("locale", "ja");

export const authUserAtom = atom<
  import("firebase/auth").User | null | undefined
>(undefined);

export const userPrivilegesAtom = atom<UserPrivileges | null | undefined>(
  undefined
);

export const oidAtom = atomWithStorage<string | null>("oid", null);

export const confAtom = atom<Conf | null | undefined>(undefined);

export const orgsAtom = atom<Org[] | undefined>(undefined);

export const usersAtom = atom<User[] | undefined>(undefined);

export const groupsAtom = atom<Group[] | undefined>(undefined);

export const providersAtom = atom<Provider[] | undefined>(undefined);

export const templatesAtom = atom<Template[] | undefined>(undefined);

export const generatorsAtom = atom<Generator[] | undefined>(undefined);

export const postsAtom = atom<Post[] | undefined>(undefined);

export const getAppState = (get: Getter): UserState | null | undefined => {
  const authUser = get(authUserAtom);
  const userPrivileges = get(userPrivilegesAtom);
  const oid = get(oidAtom);
  const conf = get(confAtom);

  return authUser === undefined || !conf
    ? undefined
    : !authUser || !userPrivileges || !oid
      ? null
      : ({
          oid: oid,
          uid: authUser!.uid!,
          sys: !!userPrivileges![OID_SYSADMIN]?.admin,
          manager: !!userPrivileges![oid!]?.manager,
          admin: !!userPrivileges![oid!]?.admin,
        } as UserState);
};

export const appStateAtom = atom<UserState | null | undefined>(getAppState);

export const getDataState = (get: Getter): UserState | null | undefined => {
  const appState = get(appStateAtom);
  const orgs = get(orgsAtom);
  const users = get(usersAtom);
  const groups = get(groupsAtom);
  const providers = get(providersAtom);
  const templates = get(templatesAtom);
  const generators = get(generatorsAtom);
  const posts = get(postsAtom);

  return !appState
    ? appState
    : orgs !== undefined &&
        users !== undefined &&
        groups !== undefined &&
        providers !== undefined &&
        templates !== undefined &&
        generators !== undefined &&
        posts !== undefined &&
        orgs?.some((org) => org.id === appState.oid) &&
        users?.some((user) => user.id === appState.uid) &&
        !!groups
          ?.filter((group) => group.id === GID_MANAGERS)
          ?.some((group) => group.members.includes(appState.uid)) ===
          appState.manager &&
        !!groups
          ?.filter((group) => group.id === GID_ADMINS)
          ?.some((group) => group.members.includes(appState.uid)) ===
          appState.admin
      ? appState
      : undefined;
};

export const dataStateAtom = atom<UserState | null | undefined>(getDataState);

export type Privilege = "guest" | "user" | "manager" | "admin" | "sys";

export const privilegesAtom = atom<Privilege[]>(["guest"]);
