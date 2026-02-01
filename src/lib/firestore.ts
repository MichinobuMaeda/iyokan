import { getDefaultStore } from "jotai";
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { type DocumentSnapshot } from "firebase/firestore";
import * as E from "fp-ts/Either";

import {
  GID_ADMINS,
  GID_MANAGERS,
  OID_SYSADMIN,
} from "../../functions/src/common";
import { db } from "./firebase";
import {
  confAtom,
  userPrivilegesAtom,
  orgsAtom,
  usersAtom,
  groupsAtom,
  providersAtom,
} from "./store";
import { confFromDoc } from "../types/Conf";
import { type UserState } from "../types/UserState";
import { orgFromDoc, type Org } from "../types/Org";
import { userFromDoc, type UserData, type User } from "../types/User";
import { groupFromDoc, type GroupData, type Group } from "../types/Group";
import {
  providerFromDoc,
  type ProviderData,
  type Provider,
} from "../types/Provider";

export function subscribeConf() {
  console.info("Start subscribeConf()");
  onSnapshot(doc(db, "service", "conf"), (doc) => {
    getDefaultStore().set(confAtom, confFromDoc(doc));
    console.info("Get conf");
  });
}

const unsubscribes: { [key: string]: Unsubscribe | null } = {};

const getOids = () =>
  Object.keys(getDefaultStore().get(userPrivilegesAtom) || {});

export function subscribeUserData(
  oid: string,
  userDataItem: UserDataItem,
  sys: boolean = false
) {
  console.info("Start subscribeUserData()");
  const { collectionName, atom, fromDoc } = userDataItem;

  unsubscribeUserData(userDataItem);
  unsubscribes[collectionName] = onSnapshot(
    collectionName === "orgs"
      ? sys
        ? collection(db, collectionName)
        : query(collection(db, collectionName), where("oid", "in", getOids()))
      : collection(db, "orgs", oid, collectionName),
    (snapshot) => {
      console.info(`Get ${collectionName}`);
      getDefaultStore().set(
        atom,
        snapshot.docs.map((doc) => fromDoc(doc)!).sort(userDataItem.sort)
      );
    },
    (onError) => {
      console.error(`Failed to subscribe to ${collectionName}`, onError);
      getDefaultStore().set(atom, undefined);
    },
    () => {
      console.info(`Completed subscription to ${collectionName}`);
      getDefaultStore().set(atom, undefined);
    }
  );
}

export function unsubscribeUserData({ collectionName }: UserDataItem) {
  if (unsubscribes[collectionName]) {
    unsubscribes[collectionName]!();
    unsubscribes[collectionName] = null;
    console.info(`Unsubscribed from ${collectionName}`);
  }
}

export interface UserDataItem {
  collectionName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromDoc: (doc: DocumentSnapshot) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sort: (a: any, b: any) => number;
  priv: boolean;
}

export const sortOrgs = (a: Org, b: Org) =>
  a.id === OID_SYSADMIN
    ? -1
    : b.id === OID_SYSADMIN
      ? 1
      : a.id.localeCompare(b.id);

export const sortUsers = (a: User, b: User) => a.name.localeCompare(b.name);

export const sortGroups = (a: Group, b: Group) =>
  a.id === GID_MANAGERS
    ? -1
    : b.id === GID_MANAGERS
      ? 1
      : a.id === GID_ADMINS
        ? -1
        : b.id === GID_ADMINS
          ? 1
          : a.name.localeCompare(b.name);

export const sortProviders = (a: Provider, b: Provider) =>
  a.type.localeCompare(b.type) || a.name.localeCompare(b.name);

export const userDataItemsAtom = (
  appState: UserState | null | undefined
): UserDataItem[] => [
  {
    collectionName: "orgs",
    atom: orgsAtom,
    fromDoc: orgFromDoc,
    sort: sortOrgs,
    priv: !!appState,
  },
  {
    collectionName: "users",
    atom: usersAtom,
    fromDoc: userFromDoc,
    sort: sortUsers,
    priv: !!appState,
  },
  {
    collectionName: "groups",
    atom: groupsAtom,
    fromDoc: groupFromDoc,
    sort: sortGroups,
    priv: !!appState,
  },
  {
    collectionName: "providers",
    atom: providersAtom,
    fromDoc: providerFromDoc,
    sort: sortProviders,
    priv: (appState?.sys || appState?.admin) ?? false,
  },
];

export function subscribeUserDataAll(appState: UserState) {
  console.info("Start subscribeUserDataAll()");
  const userDataItems = userDataItemsAtom(appState);
  userDataItems
    .filter((item) => item.priv)
    .forEach((item) => {
      subscribeUserData(appState.oid, item, appState.sys);
    });
}

export function unsubscribeUserDataAll(appState: UserState | null | undefined) {
  console.info("Start unsubscribeUserDataAll()");
  const userDataItems = userDataItemsAtom(appState);
  userDataItems.forEach((item) => {
    unsubscribeUserData(item);
  });
}

/**
 * Updates an org document with the provided data
 * @param formData - Org object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrg(
  formData: Org
): Promise<E.Either<"errorUpdateOrg", void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = formData;

    data.name = data.name.trim();
    data.desc = data.desc?.trim() ?? "";
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "orgs", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrg error:", error);
    return E.left("errorUpdateOrg");
  }
}

/**
 * Updates an org user document with the provided data
 * @param oid - The organization ID
 * @param id - The user ID
 * @param formData - User object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrgUser(
  oid: string,
  id: string,
  formData: UserData
): Promise<E.Either<"errorUpdateUser", void>> {
  try {
    const { ...data } = formData;

    data.name = data.name.trim();
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "orgs", oid, "users", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgUser error:", error);
    return E.left("errorUpdateUser");
  }
}

/**
 * Updates an org group document with the provided data
 * @param oid - The organization ID
 * @param id - The group ID
 * @param formData - Group object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrgGroup(
  oid: string,
  id: string,
  formData: GroupData
): Promise<E.Either<"errorUpdateGroup", void>> {
  try {
    const { ...data } = formData;

    data.name = data.name.trim();
    data.members = data.members || [];
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "orgs", oid, "groups", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgGroup error:", error);
    return E.left("errorUpdateGroup");
  }
}

/**
 * Updates a provider with the provided data
 * @param oid - The organization ID
 * @param id - The provider ID
 * @param formData - Provider object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateProvider(
  oid: string,
  id: string,
  formData: ProviderData
): Promise<E.Either<"errorUpdateProvider", void>> {
  try {
    const { ...data } = formData;

    data.name = data.name.trim();
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "orgs", oid, "providers", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateProvider error:", error);
    return E.left("errorUpdateProvider");
  }
}
