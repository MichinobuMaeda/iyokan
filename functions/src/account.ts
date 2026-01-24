import { FieldValue } from "firebase-admin/firestore";
import * as E from "fp-ts/lib/Either.js";

import {
  type Context,
  isOrganizationMember,
  isGroupMember,
} from "./firebase.js";
import { GID_MANAGERS, GID_ADMINS, UserPrivileges } from "./common.js";

/**
 * Generates a random password for user account creation.
 * Returns the DEFAULT_PASSWORD from environment variable if set, otherwise generates a random string.
 * @returns Password string - either from DEFAULT_PASSWORD env var or a randomly generated 40-character string
 */
export function generateRandomPassword(): string {
  return process.env.DEFAULT_PASSWORD
    ? process.env.DEFAULT_PASSWORD
    : Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);
}

/**
 * Retrieves an existing Firebase Auth user by their email address.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.auth - Firebase Admin Auth instance
 * @param email - Email address of the user to retrieve
 * @returns A Promise that resolves to Either:
 *   - Right(uid) if user is found (user ID as string)
 *   - Right(null) if user is not found
 *   - Left(Error) if the lookup fails for reasons other than user not found
 */
export const getExistingAuthUserByEmail = async (
  { auth }: Context,
  email: string
): Promise<E.Either<Error, string | null>> => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return E.right(userRecord.uid);
  } catch (error) {
    if ((error as any).code !== "auth/user-not-found") {
      return E.left(error as Error);
    }
  }
  return E.right(null);
};

/**
 * Creates a new Firebase Auth user if one doesn't already exist with the given email.
 * If a user already exists, returns the existing user record.
 * New users are created with a randomly generated password.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.auth - Firebase Admin Auth instance
 * @param context.logger - Firebase Functions logger for logging user creation events
 * @param params - Object containing user details
 * @param params.email - Email address for the new user
 * @param params.name - Display name for the new user
 * @returns A Promise that resolves to Either:
 *   - Right(uid) if successful (user ID of existing or newly created user)
 *   - Left(Error) if user creation or lookup fails
 */
export const createAuthUserIfNotExists = async (
  context: Context,
  { email, name }: { email: string; name: string }
): Promise<E.Either<Error, string>> => {
  const { auth, logger } = context;

  // Get existing user by email
  const existingUser = await getExistingAuthUserByEmail(context, email);
  if (E.isLeft(existingUser)) {
    throw existingUser.left;
  }

  if (E.isRight(existingUser) && existingUser.right) {
    logger.info("Auth account already exists", {
      uid: existingUser.right,
      email,
    });

    return E.right(existingUser.right);
  } else {
    try {
      // Generate random password
      const password = generateRandomPassword();
      console.log("DEFAULT_PASSWORD", process.env.DEFAULT_PASSWORD);

      // Create auth account
      const userRecord = await auth.createUser({
        displayName: name || undefined,
        email,
        password,
      });

      logger.info("Auth account created", {
        uid: userRecord.uid,
        email,
      });

      return E.right(userRecord.uid);
    } catch (error) {
      logger.error("Failed to create auth account", { error });
      return E.left(error as Error);
    }
  }
};

/**
 * Creates an organization user in both Firebase Auth and Firestore.
 * Creates an auth account if it doesn't exist, then adds the user to the organization's users subcollection.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.auth - Firebase Admin Auth instance
 * @param context.db - Firebase Admin Firestore instance
 * @param context.logger - Firebase Functions logger for logging user creation events
 * @param data - Object containing organization user details
 * @param data.oid - Organization ID where the user will be added
 * @param data.email - Email address for the user
 * @param data.name - Display name for the user
 * @param data.valid - Whether the user account is valid/active
 * @returns A Promise that resolves to Either:
 *   - Right(uid) if successful (user ID of created organization user)
 *   - Left(Error) if user creation or Firestore operations fail
 */
export const createOrgUser = async (
  context: Context,
  { data }: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, string>> => {
  const { db, logger } = context;

  try {
    const { oid, email, name, valid } = data;

    if (!oid || !email || !name) {
      logger.error("Missing required user data", { data });
      return E.left(new Error("Missing required user data"));
    }

    const uid = await createAuthUserIfNotExists(context, {
      email: email,
      name: name,
    });

    if (E.isLeft(uid)) {
      logger.error("Failed to create or retrieve auth user", {
        error: uid.left,
      });
      return E.left(uid.left);
    }

    await db
      .collection("orgs")
      .doc(oid)
      .collection("users")
      .doc(uid.right)
      .set({
        name,
        email,
        valid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    logger.info("User created in Firestore", {
      oid,
      uid: uid.right,
      email,
    });

    logger.info("User creation process completed", { uid: uid.right });
    return E.right(uid.right);
  } catch (error) {
    logger.error("Failed to create user account", { error });
    return E.left(error as Error);
  }
};

/**
 * Retrieves user privileges across all organizations.
 * Checks organization membership and manager/admin roles for the specified user.
 *
 * @param context - Context object containing Firebase Admin instances
 * @param context.db - Firebase Admin Firestore instance
 * @param request - Callable request object
 * @param request.data - Request data containing the user ID
 * @param request.data.uid - User ID for which to retrieve privileges
 * @returns A Promise that resolves to Either:
 *   - Right(UserPrivileges) if successful (object mapping organization IDs to manager/admin flags)
 *   - Left(Error) if no UID is provided or privileges lookup fails
 */
export const getUserPrivileges = async (
  context: Context,
  { data }: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, UserPrivileges>> => {
  const uid = data?.uid;
  if (!uid) {
    return E.left(new Error("No UID provided"));
  }

  try {
    const orgs = await context.db
      .collection("orgs")
      .where("valid", "==", true)
      .get();
    const privList: Array<UserPrivileges | undefined> = await Promise.all(
      orgs.docs.map(async (org) => {
        const isMember = await isOrganizationMember(context, {
          uid,
          oid: org.id,
        });

        const isManager = await isGroupMember(context, {
          uid,
          oid: org.id,
          gid: GID_MANAGERS,
        });

        const isAdmin = await isGroupMember(context, {
          uid,
          oid: org.id,
          gid: GID_ADMINS,
        });

        return E.isRight(isMember) && isMember.right
          ? {
              [`${org.id}`]: {
                manager: E.isRight(isManager) && isManager.right,
                admin: E.isRight(isAdmin) && isAdmin.right,
              },
            }
          : undefined;
      })
    );

    const privs: UserPrivileges = {};
    privList
      .filter((priv) => !!priv)
      .forEach((priv) => Object.assign(privs, priv!));

    return E.right(privs);
  } catch (error) {
    return E.left(error as Error);
  }
};
