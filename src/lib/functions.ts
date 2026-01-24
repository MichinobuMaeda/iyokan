import { httpsCallable } from "firebase/functions";
import * as E from "fp-ts/Either";

import { functions } from "./firebase";
import { type UserData } from "../types/User";
import { type OrgData } from "../types/Org";

export async function createOrg(
  formData: { oid: string } & OrgData
): Promise<E.Either<"errorCreateOrg", void>> {
  try {
    const createOrgFunction = httpsCallable(functions, "createOrg");
    await createOrgFunction(formData);
    return E.right(undefined);
  } catch (error) {
    console.error("createOrg error:", error);
    return E.left("errorCreateOrg");
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
