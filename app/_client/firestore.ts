"use client";

import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as E from "fp-ts/Either";

import { OrgData, Org } from "@/app/_types/Org";
import { ProviderData, Provider } from "@/app/_types/Provider";
import { User } from "@/app/_types/User";
import { db } from "./firebase";

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
    data.active = Boolean(data.active);

    await setDoc(
      doc(db, "orgs", id),
      {
        ...data,
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
    data.active = Boolean(data.active);

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
 * Creates or updates a provider document with the provided data
 * @param data - ProviderData object containing the fields to save
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function saveProvider(
  data: ProviderData
): Promise<E.Either<"errorSaveProvider", void>> {
  try {
    data.type = data.type.trim();
    data.name = data.type;
    const id = data.type;

    await setDoc(
      doc(db, "providers", id),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return E.right(undefined);
  } catch (error) {
    console.error("saveProvider error:", error);
    return E.left("errorSaveProvider");
  }
}

/**
 * Updates a provider document with the provided data
 * @param formData - Provider object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function updateProvider(
  formData: Provider
): Promise<E.Either<"errorUpdateProvider", void>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...data } = formData;

    data.type = id;
    data.name = id;
    data.params = data.params.map((param) => ({
      key: param.key.trim(),
      value: param.value.trim(),
    }));
    data.valid = Boolean(data.valid);

    await updateDoc(doc(db, "providers", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return E.right(undefined);
  } catch (error) {
    console.error("updateProvider error:", error);
    return E.left("errorUpdateProvider");
  }
}
