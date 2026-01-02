"use client";

import { doc, updateDoc, setDoc, Firestore } from "firebase/firestore";
import * as E from "fp-ts/Either";

import { OrgData } from "@/app/_types/Org";
import { ProviderData } from "@/app/_types/Provider";
import { UserData } from "@/app/_types/User";
import { db } from "./firebase";

/**
 * Updates an admin document with the provided data
 * @param id - The admin document ID
 * @param data - UserData object containing the fields to update
 * @param firestore - Optional Firestore instance (defaults to client db)
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function updateAdmin(
  id: string,
  data: UserData,
  firestore?: Firestore
): Promise<E.Either<Error, void>> {
  const dbInstance = firestore || db;
  const adminRef = doc(dbInstance, "admins", id);

  try {
    await updateDoc(adminRef, {
      ...data,
      updatedAt: new Date(),
    });
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to update admin")
    );
  }
}

/**
 * Creates or updates an org document with the provided data
 * @param id - The org document ID
 * @param data - OrgData object containing the fields to save
 * @param firestore - Optional Firestore instance (defaults to client db)
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function saveOrg(
  id: string,
  data: OrgData,
  firestore?: Firestore
): Promise<E.Either<Error, void>> {
  const dbInstance = firestore || db;
  const orgRef = doc(dbInstance, "org", id);

  try {
    await setDoc(
      orgRef,
      {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to save org")
    );
  }
}

/**
 * Updates an org document with the provided data
 * @param id - The org document ID
 * @param data - OrgData object containing the fields to update
 * @param firestore - Optional Firestore instance (defaults to client db)
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function updateOrg(
  id: string,
  data: OrgData,
  firestore?: Firestore
): Promise<E.Either<Error, void>> {
  const dbInstance = firestore || db;
  const orgRef = doc(dbInstance, "org", id);

  try {
    await updateDoc(orgRef, {
      ...data,
      updatedAt: new Date(),
    });
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to update org")
    );
  }
}

/**
 * Creates or updates a provider document with the provided data
 * @param id - The provider document ID
 * @param data - ProviderData object containing the fields to save
 * @param firestore - Optional Firestore instance (defaults to client db)
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function saveProvider(
  id: string,
  data: ProviderData,
  firestore?: Firestore
): Promise<E.Either<Error, void>> {
  const dbInstance = firestore || db;
  const providerRef = doc(dbInstance, "providers", id);

  try {
    await setDoc(
      providerRef,
      {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to save provider")
    );
  }
}

/**
 * Updates a provider document with the provided data
 * @param id - The provider document ID
 * @param data - ProviderData object containing the fields to update
 * @param firestore - Optional Firestore instance (defaults to client db)
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function updateProvider(
  id: string,
  data: ProviderData,
  firestore?: Firestore
): Promise<E.Either<Error, void>> {
  const dbInstance = firestore || db;
  const providerRef = doc(dbInstance, "providers", id);

  try {
    await updateDoc(providerRef, {
      ...data,
      updatedAt: new Date(),
    });
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to update provider")
    );
  }
}
