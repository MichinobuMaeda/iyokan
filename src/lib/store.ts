import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import {
  type UserPrivileges,
  GID_ADMINS,
  GID_MANAGERS,
  OID_SYSADMIN,
} from "../../functions/src/common";
import type { UserState } from "../types/UserState";
import type { Conf } from "../types/Conf";
import type { Org } from "../types/Org";
import type { User } from "../types/User";
import type { Group } from "../types/Group";
import type { Provider } from "../types/Provider";

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

export const authStateAtom = atom<UserState | null | undefined>((get) =>
  get(authUserAtom) === undefined || !get(confAtom)
    ? undefined
    : !get(authUserAtom) || !get(userPrivilegesAtom) || !get(oidAtom)
      ? null
      : ({
          oid: get(oidAtom),
          uid: get(authUserAtom)!.uid!,
          sys: !!get(userPrivilegesAtom)![OID_SYSADMIN]?.admin,
          manager: !!get(userPrivilegesAtom)![get(oidAtom)!]?.manager,
          admin: !!get(userPrivilegesAtom)![get(oidAtom)!]?.admin,
        } as UserState)
);

export const userStateAtom = atom<UserState | null | undefined>((get) => {
  const authState = get(authStateAtom);
  const orgs = get(orgsAtom);
  const users = get(usersAtom);
  const groups = get(groupsAtom);
  const providers = get(providersAtom);
  return !authState
    ? authState
    : orgs !== undefined &&
        users !== undefined &&
        groups !== undefined &&
        providers !== undefined &&
        orgs?.some((org) => org.id === authState.oid) &&
        users?.some((user) => user.id === authState.uid) &&
        !!groups
          ?.filter((group) => group.id === GID_MANAGERS)
          ?.some((group) => group.members.includes(authState.uid)) ===
          authState.manager &&
        !!groups
          ?.filter((group) => group.id === GID_ADMINS)
          ?.some((group) => group.members.includes(authState.uid)) ===
          authState.admin
      ? authState
      : undefined;
});
