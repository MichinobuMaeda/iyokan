import {
  doc,
  getDoc,
  collection,
  getDocs,
  Firestore,
} from "firebase/firestore";
import * as E from "fp-ts/Either";

import { User } from "../_types/User";
import { Org } from "../_types/Org";
import { Provider } from "../_types/Provider";

/**
 * Gets an array of User objects from the "admins" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an Error or array of User objects
 */
export async function getAdmins(
  firestore: Firestore
): Promise<E.Either<Error, User[]>> {
  const adminsRef = collection(firestore, "admins");

  try {
    const snapshot = await getDocs(adminsRef);

    const users: User[] = [];
    snapshot.forEach((doc) => {
      const user = User.fromDoc(doc);
      if (user) {
        users.push(user);
      }
    });

    return E.right(users);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch admins")
    );
  }
}

/**
 * Gets a single User object from the "admins" collection by ID
 * @param firestore - Firestore instance
 * @param adminId - The admin document ID
 * @returns Promise that resolves to Either containing an Error or User object
 */
export async function getAdmin(
  firestore: Firestore,
  adminId: string
): Promise<E.Either<Error, User>> {
  try {
    const adminRef = doc(firestore, "admins", adminId);
    const snapshot = await getDoc(adminRef);

    const user = User.fromDoc(snapshot);
    if (!user) {
      return E.left(new Error("Admin not found"));
    }

    return E.right(user);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch admin")
    );
  }
}

/**
 * Gets an array of Org objects from the "org" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an Error or array of Org objects
 */
export async function getOrgs(
  firestore: Firestore
): Promise<E.Either<Error, Org[]>> {
  const orgsRef = collection(firestore, "org");

  try {
    const snapshot = await getDocs(orgsRef);

    const orgs: Org[] = [];
    snapshot.forEach((doc) => {
      const org = Org.fromDoc(doc);
      if (org) {
        orgs.push(org);
      }
    });

    return E.right(orgs);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch orgs")
    );
  }
}

/**
 * Gets a single Org object from the "org" collection by ID
 * @param firestore - Firestore instance
 * @param oid - The org document ID
 * @returns Promise that resolves to Either containing an Error or Org object
 */
export async function getOrg(
  firestore: Firestore,
  oid: string
): Promise<E.Either<Error, Org>> {
  try {
    const orgRef = doc(firestore, "org", oid);
    const snapshot = await getDoc(orgRef);

    const org = Org.fromDoc(snapshot);
    if (!org) {
      return E.left(new Error("Organization not found"));
    }

    return E.right(org);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch org")
    );
  }
}

/**
 * Gets an array of Provider objects from the "providers" collection
 * @param firestore - Firestore instance
 * @returns Promise that resolves to Either containing an Error or array of Provider objects
 */
export async function getProviders(
  firestore: Firestore
): Promise<E.Either<Error, Provider[]>> {
  const providersRef = collection(firestore, "providers");

  try {
    const snapshot = await getDocs(providersRef);

    const providers: Provider[] = [];
    snapshot.forEach((doc) => {
      const provider = Provider.fromDoc(doc);
      if (provider) {
        providers.push(provider);
      }
    });

    return E.right(providers);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch providers")
    );
  }
}

/**
 * Gets a single Provider object from the "providers" collection by ID
 * @param firestore - Firestore instance
 * @param providerId - The provider document ID
 * @returns Promise that resolves to Either containing an Error or Provider object
 */
export async function getProvider(
  firestore: Firestore,
  providerId: string
): Promise<E.Either<Error, Provider>> {
  try {
    const providerRef = doc(firestore, "providers", providerId);
    const snapshot = await getDoc(providerRef);

    const provider = Provider.fromDoc(snapshot);
    if (!provider) {
      return E.left(new Error("Provider not found"));
    }

    return E.right(provider);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to fetch provider")
    );
  }
}
