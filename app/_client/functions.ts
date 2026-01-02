"use client";

import { httpsCallable } from "firebase/functions";
import * as E from "fp-ts/Either";

import { UserData } from "@/app/_types/User";
import { functions } from "./firebase";

/**
 * Creates a new admin by calling the Cloud Function
 * @param data - UserData object containing the fields to update
 * @returns Promise that resolves to Either containing an Error or void
 */
export async function createAdmin(
  data: UserData
): Promise<E.Either<Error, void>> {
  try {
    const createAdminFunction = httpsCallable(functions, "createAdmin");
    await createAdminFunction(data);
    return E.right(undefined);
  } catch (error) {
    return E.left(
      error instanceof Error ? error : new Error("Failed to create admin")
    );
  }
}
