import { getDefaultStore } from "jotai";
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  addDoc,
  setDoc,
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
import type { TranslationKey } from "../i18n/i18n";
import { db } from "./firebase";
import {
  confAtom,
  userPrivilegesAtom,
  orgsAtom,
  usersAtom,
  groupsAtom,
  providersAtom,
  templatesAtom,
  generatorsAtom,
  postsAtom,
} from "./store";
import { confFromDoc, type ConfData } from "../types/Conf";
import { type UserState } from "../types/UserState";
import { orgFromDoc, type Org } from "../types/Org";
import { userFromDoc, type UserData, type User } from "../types/User";
import { groupFromDoc, type GroupData, type Group } from "../types/Group";
import {
  providerFromDoc,
  type ProviderData,
  type Provider,
} from "../types/Provider";
import {
  templateFromDoc,
  type TemplateData,
  type Template,
} from "../types/Template";
import {
  generatorFromDoc,
  type GeneratorData,
  type Generator,
} from "../types/Generator";
import { postFromDoc, type PostData, type Post } from "../types/Post";

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

export const sortTemplates = (a: Template, b: Template) =>
  a.name.localeCompare(b.name);

export const sortGenerators = (a: Generator, b: Generator) =>
  a.name.localeCompare(b.name);

export const sortPosts = (a: Post, b: Post) =>
  b.schedule.getTime() - a.schedule.getTime();

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
  {
    collectionName: "templates",
    atom: templatesAtom,
    fromDoc: templateFromDoc,
    sort: sortTemplates,
    priv: !!appState,
  },
  {
    collectionName: "generators",
    atom: generatorsAtom,
    fromDoc: generatorFromDoc,
    sort: sortGenerators,
    priv: !!appState,
  },
  {
    collectionName: "posts",
    atom: postsAtom,
    fromDoc: postFromDoc,
    sort: sortPosts,
    priv: !!appState,
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

export async function updateConf(
  formData: ConfData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await updateDoc(doc(db, "service", "conf"), {
      webUrl: formData.webUrl.trim(),
      desc: formData.desc?.trim() ?? "",
      hardBreak: Boolean(formData.hardBreak),
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateConf error:", error);
    return E.left("defaultErrorMessage");
  }
}

/**
 * Updates an org document with the provided data
 * @param formData - Org object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrg(
  formData: Org
): Promise<E.Either<TranslationKey, void>> {
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
    return E.left("defaultErrorMessage");
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
): Promise<E.Either<TranslationKey, void>> {
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
    return E.left("defaultErrorMessage");
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
): Promise<E.Either<TranslationKey, void>> {
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
    return E.left("defaultErrorMessage");
  }
}

export async function createOrgProvider(
  oid: string,
  formData: ProviderData
): Promise<E.Either<TranslationKey, void>> {
  try {
    const { type, name, valid, params } = formData;

    await addDoc(collection(db, "orgs", oid, "providers"), {
      type,
      name: name.trim(),
      ...params.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
      valid: !!valid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("createOrgProvider error:", error);
    return E.left("defaultErrorMessage");
  }
}

/**
 * Updates a provider with the provided data
 * @param oid - The organization ID
 * @param id - The provider ID
 * @param formData - Provider object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrgProvider(
  oid: string,
  id: string,
  formData: ProviderData
): Promise<E.Either<TranslationKey, void>> {
  try {
    const { type, name, valid, params } = formData;

    await updateDoc(doc(db, "orgs", oid, "providers", id), {
      type,
      name: name.trim(),
      ...params.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
      valid: !!valid,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgProvider error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function createOrgTemplate(
  oid: string,
  formData: TemplateData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await addDoc(collection(db, "orgs", oid, "templates"), {
      name: formData.name.trim(),
      title: formData.title.trim(),
      message: formData.message.trim(),
      link: formData.link.trim(),
      feed: formData.feed.trim(),
      category: formData.category.trim(),
      valid: !!formData.valid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("createOrgTemplate error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function updateOrgTemplate(
  oid: string,
  id: string,
  formData: TemplateData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await updateDoc(doc(db, "orgs", oid, "templates", id), {
      name: formData.name.trim(),
      title: formData.title.trim(),
      message: formData.message.trim(),
      link: formData.link.trim(),
      feed: formData.feed.trim(),
      category: formData.category.trim(),
      valid: !!formData.valid,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgTemplate error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function createOrgGenerator(
  oid: string,
  formData: GeneratorData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await addDoc(collection(db, "orgs", oid, "generators"), {
      name: formData.name.trim(),
      source: formData.source.trim(),
      prompt: formData.prompt.trim(),
      providers: formData.providers || [],
      valid: !!formData.valid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("createOrgGenerator error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function updateOrgGenerator(
  oid: string,
  id: string,
  formData: GeneratorData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await updateDoc(doc(db, "orgs", oid, "generators", id), {
      name: formData.name.trim(),
      source: formData.source.trim(),
      prompt: formData.prompt.trim(),
      providers: formData.providers || [],
      valid: !!formData.valid,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgGenerator error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function createOrgPost(
  oid: string,
  id: string,
  formData: PostData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await setDoc(doc(db, "orgs", oid, "posts", id), {
      schedule: formData.schedule,
      title: formData.title.trim(),
      message: formData.message.trim(),
      link: formData.link.trim(),
      files: formData.files || [],
      providers: formData.providers || [],
      status: formData.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("createOrgPost error:", error);
    return E.left("defaultErrorMessage");
  }
}

export async function updateOrgPost(
  oid: string,
  id: string,
  formData: PostData
): Promise<E.Either<TranslationKey, void>> {
  try {
    await updateDoc(doc(db, "orgs", oid, "posts", id), {
      schedule: formData.schedule,
      title: formData.title.trim(),
      message: formData.message.trim(),
      link: formData.link.trim(),
      files: formData.files || [],
      providers: formData.providers || [],
      status: formData.status,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateOrgPost error:", error);
    return E.left("defaultErrorMessage");
  }
}
