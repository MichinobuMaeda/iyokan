import * as E from "fp-ts/lib/Either.js";

export type Context = {
  auth: import("firebase-admin").auth.Auth;
  db: import("firebase-admin").firestore.Firestore;
  logger: typeof import("firebase-functions").logger;
};

/**
 * Checks if a user is a valid member of an organization.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.db - Firebase Admin Firestore instance
 * @param params - Object containing membership check parameters
 * @param params.uid - User ID to check
 * @param params.oid - Organization ID
 * @returns A Promise that resolves to Either:
 *   - Right(true) if user exists in the organization and is valid
 *   - Right(false) if user doesn't exist or is not valid
 *   - Left(Error) if the Firestore query fails
 */
export async function isOrganizationMember(
  context: Context,
  { uid, oid }: { uid?: string; oid?: string }
): Promise<E.Either<Error, boolean>> {
  if (!uid || !oid) {
    return E.right(false);
  }
  try {
    const doc = await context.db
      .collection("orgs")
      .doc(oid)
      .collection("users")
      .doc(uid)
      .get();

    return E.right(doc.exists && doc.data()?.valid);
  } catch (error) {
    return E.left(error as Error);
  }
}

/**
 * Checks if a user is a member of a specific group within an organization.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.db - Firebase Admin Firestore instance
 * @param params - Object containing membership check parameters
 * @param params.uid - User ID to check
 * @param params.oid - Organization ID
 * @param params.gid - Group ID to check membership in
 * @returns A Promise that resolves to Either:
 *   - Right(true) if user is in the specified group
 *   - Right(false) if user is not in the specified group
 *   - Left(Error) with "unknown state" if the group doesn't exist
 *   - Left(Error) if the Firestore query fails
 */
export async function isGroupMember(
  context: Context,
  { uid, oid, gid }: { uid?: string; oid?: string; gid?: string }
): Promise<E.Either<Error, boolean>> {
  if (!uid || !oid || !gid) {
    return E.right(false);
  }
  try {
    const doc = await context.db
      .collection("orgs")
      .doc(oid)
      .collection("groups")
      .doc(gid)
      .get();

    if (!doc.exists) {
      return E.left(new Error("unknown state"));
    }

    return E.right(!!doc.data()?.members.includes(uid));
  } catch (error) {
    return E.left(error as Error);
  }
}
