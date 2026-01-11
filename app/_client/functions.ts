"use client";

import { httpsCallable } from "firebase/functions";
import * as E from "fp-ts/Either";

import { UserData } from "@/app/_types/User";
import { functions } from "./firebase";

/**
 * Creates a new admin by calling the Cloud Function
 * @param formData - UserData object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function createAdmin(
  formData: UserData
): Promise<E.Either<"errorCreateAdmin", void>> {
  try {
    const createAdminFunction = httpsCallable(functions, "createAdmin");
    await createAdminFunction(formData);
    return E.right(undefined);
  } catch (error) {
    console.error("createAdmin error:", error);
    return E.left("errorCreateAdmin");
  }
}

/**
 * Creates a new org user by calling the Cloud Function
 * @param oid - Organization ID where the user will be added
 * @param formData - UserData object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function createUser(
  oid: string,
  formData: UserData
): Promise<E.Either<"errorCreateUser", void>> {
  try {
    const createUserFunction = httpsCallable(functions, "createUser");
    await createUserFunction({ oid, ...formData });
    return E.right(undefined);
  } catch (error) {
    console.error("createUser error:", error);
    return E.left("errorCreateUser");
  }
}
