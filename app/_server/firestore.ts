import {
  doc,
  getDoc,
  collection,
  getDocs,
  Firestore,
} from "firebase/firestore";
import * as E from "fp-ts/Either";

import { User, userFromDoc } from "@/app/_types/User";
import { Org, orgFromDoc } from "@/app/_types/Org";
import { Provider, providerFromDoc } from "@/app/_types/Provider";

/**
 * Gets an array of User objects from the "admins" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an i18n key or array of User objects
 */
export async function getAdmins(
  firestore: Firestore
): Promise<E.Either<"errorFetchAdmins", User[]>> {
  const adminsRef = collection(firestore, "admins");

  try {
    const snapshot = await getDocs(adminsRef);

    const users: User[] = [];
    snapshot.forEach((doc) => {
      const user = userFromDoc(doc);
      if (user) {
        users.push(user);
      }
    });

    return E.right(users);
  } catch (error) {
    console.error("getAdmins error:", error);
    return E.left("errorFetchAdmins");
  }
}

/**
 * Gets a single User object from the "admins" collection by ID
 * @param firestore - Firestore instance
 * @param adminId - The admin document ID
 * @returns Promise that resolves to Either containing an i18n key or User object
 */
export async function getAdmin(
  firestore: Firestore,
  adminId: string
): Promise<E.Either<"errorAdminNotFound" | "errorFetchAdmin", User>> {
  try {
    const adminRef = doc(firestore, "admins", adminId);
    const snapshot = await getDoc(adminRef);

    const user = userFromDoc(snapshot);
    if (!user) {
      return E.left("errorAdminNotFound");
    }

    return E.right(user);
  } catch (error) {
    console.error("getAdmin error:", error);
    return E.left("errorFetchAdmin");
  }
}

/**
 * Gets an array of Org objects from the "orgs" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an i18n key or array of Org objects
 */
export async function getOrgs(
  firestore: Firestore
): Promise<E.Either<"errorFetchOrgs", Org[]>> {
  const orgsRef = collection(firestore, "orgs");

  try {
    const snapshot = await getDocs(orgsRef);

    const orgs: Org[] = [];
    snapshot.forEach((doc) => {
      const org = orgFromDoc(doc);
      if (org) {
        orgs.push(org);
      }
    });

    return E.right(orgs);
  } catch (error) {
    console.error("getOrgs error:", error);
    return E.left("errorFetchOrgs");
  }
}

/**
 * Gets a single Org object from the "orgs" collection by ID
 * @param firestore - Firestore instance
 * @param oid - The org document ID
 * @returns Promise that resolves to Either containing an i18n key or Org object
 */
export async function getOrg(
  firestore: Firestore,
  oid: string
): Promise<E.Either<"errorOrgNotFound" | "errorFetchOrg", Org>> {
  try {
    const orgRef = doc(firestore, "orgs", oid);
    const snapshot = await getDoc(orgRef);

    const org = orgFromDoc(snapshot);
    if (!org) {
      return E.left("errorOrgNotFound");
    }

    return E.right(org);
  } catch (error) {
    console.error("getOrg error:", error);
    return E.left("errorFetchOrg");
  }
}

/**
 * Gets an array of Provider objects from the "providers" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an i18n key or array of Provider objects
 */
export async function getProviders(
  firestore: Firestore
): Promise<E.Either<"errorFetchProviders", Provider[]>> {
  const providersRef = collection(firestore, "providers");

  try {
    const snapshot = await getDocs(providersRef);

    const providers: Provider[] = [];
    snapshot.forEach((doc) => {
      const provider = providerFromDoc(doc);
      if (provider) {
        providers.push(provider);
      }
    });

    return E.right(providers);
  } catch (error) {
    console.error("getProviders error:", error);
    return E.left("errorFetchProviders");
  }
}

/**
 * Gets a single Provider object from the "providers" collection by ID
 * @param firestore - Firestore instance
 * @param providerId - The provider document ID
 * @returns Promise that resolves to Either containing an i18n key or Provider object
 */
export async function getProvider(
  firestore: Firestore,
  providerId: string
): Promise<E.Either<"errorProviderNotFound" | "errorFetchProvider", Provider>> {
  try {
    const providerRef = doc(firestore, "providers", providerId);
    const snapshot = await getDoc(providerRef);

    const provider = providerFromDoc(snapshot);
    if (!provider) {
      return E.left("errorProviderNotFound");
    }

    return E.right(provider);
  } catch (error) {
    console.error("getProvider error:", error);
    return E.left("errorFetchProvider");
  }
}
