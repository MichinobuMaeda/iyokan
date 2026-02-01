import { httpsCallable } from "firebase/functions";
import * as E from "fp-ts/Either";

import type { UserPrivileges } from "../../functions/src/common";
import type { CreateOrgData } from "../../functions/src/common";
import { functions } from "./firebase";
import type { CreateUserData } from "../../functions/src/common";

const getUserPrivsFunction = httpsCallable(functions, "getUserPrivs");
const createOrgFunction = httpsCallable(functions, "createOrg");
const createUserFunction = httpsCallable(functions, "createUser");

export async function getUserPrivs(
  uid?: string
): Promise<E.Either<"errorGetUserPrivs", UserPrivileges>> {
  if (!uid) {
    console.info("getUserPrivs uid:", uid);
    return E.left("errorGetUserPrivs");
  }
  try {
    const result = await getUserPrivsFunction({ uid });
    const privs = result.data as UserPrivileges;

    return Object.keys(privs).length === 0
      ? E.left("errorGetUserPrivs")
      : E.right(privs);
  } catch (error) {
    console.error("getUserPrivs error:", error);
    return E.left("errorGetUserPrivs");
  }
}

export async function createOrg(
  formData: CreateOrgData
): Promise<E.Either<"errorCreateOrg", void>> {
  try {
    await createOrgFunction(formData);
    return E.right(undefined);
  } catch (error) {
    console.error("createOrg error:", error);
    return E.left("errorCreateOrg");
  }
}

/**
 * Creates a new org user by calling the Cloud Function
 * @param data - CreateUserData object containing the fields to update
 * @returns Promise that resolves to Either containing an i18n key or void
 */
export async function createUser(
  data: CreateUserData
): Promise<E.Either<"errorCreateUser", void>> {
  try {
    await createUserFunction(data);
    return E.right(undefined);
  } catch (error) {
    console.error("createUser error:", error);
    return E.left("errorCreateUser");
  }
}
