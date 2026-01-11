"use client";

import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as E from "fp-ts/Either";

import { OrgData, Org } from "@/app/_types/Org";
import { ProviderData, Provider } from "@/app/_types/Provider";
import { User } from "@/app/_types/User";
import { db } from "./firebase";

/**
 * Creates a new provider document
 * @param oid - The organization ID
 * @param data - ProviderData object containing the fields to save
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function saveProvider(
  oid: string,
  data: ProviderData & Record<string, unknown>
): Promise<E.Either<"errorSaveProvider", void>> {
  try {
    const providerId = `${data.type}-${Date.now()}`;

    await setDoc(doc(db, "orgs", oid, "providers", providerId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return E.right(undefined);
  } catch (error) {
    console.error("saveProvider error:", error);
    return E.left("errorSaveProvider");
  }
}

/**
 * Updates an admin document with the provided data
 * @param formData - User object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateAdmin(
  formData: User
): Promise<E.Either<"errorUpdateAdmin", void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = formData;

    data.email = data.email.trim();
    data.name = data.name.trim();
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "admins", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateAdmin error:", error);
    return E.left("errorUpdateAdmin");
  }
}

/**
 * Creates or updates an org document with the provided data
 * @param id - The org document ID
 * @param data - OrgData object containing the fields to save
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function saveOrg(
  id: string,
  data: OrgData
): Promise<E.Either<"errorSaveOrg", void>> {
  try {
    data.name = data.name.trim();
    data.desc = data.desc?.trim() ?? "";
    data.valid = Boolean(data.valid);

    await setDoc(
      doc(db, "orgs", id),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "orgs", id, "groups", "managers"),
      {
        name: "Managers",
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "orgs", id, "groups", "admins"),
      {
        name: "Admins",
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return E.right(undefined);
  } catch (error) {
    console.error("saveOrg error:", error);
    return E.left("errorSaveOrg");
  }
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
 * @param formData - User object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateOrgUser(
  oid: string,
  formData: User
): Promise<E.Either<"errorUpdateUser", void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = formData;

    data.email = data.email.trim();
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
 * Updates a provider with the provided data
 * @param oid - The organization ID
 * @param formData - Provider object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateProvider(
  oid: string,
  formData: Provider
): Promise<E.Either<"errorUpdateProvider", void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = formData;

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
