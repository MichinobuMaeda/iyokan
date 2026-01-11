import { FieldValue } from "firebase-admin/firestore";

/**
 * Retrieves an existing Firebase Auth user by their email address.
 *
 * @param auth - Firebase Admin Auth instance
 * @param email - Email address of the user to retrieve
 * @returns A Promise that resolves to the UserRecord if found, or null if not found
 * @throws Error if the lookup fails for reasons other than user not found
 *
 * @example
 * ```typescript
 * const user = await getExistingAuthUserByEmail(auth, "user@example.com");
 * if (user) {
 *   console.log("User found:", user.uid);
 * }
 * ```
 */
export const getExistingAuthUserByEmail = async (
  auth: import("firebase-admin").auth.Auth,
  email: string
): Promise<import("firebase-admin").auth.UserRecord | null> => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if ((error as any).code !== "auth/user-not-found") {
      throw error;
    }
  }
  return null;
};

/**
 * Creates a new Firebase Auth user if one doesn't already exist with the given email.
 * If a user already exists, returns the existing user record.
 * New users are created with a randomly generated password.
 *
 * @param auth - Firebase Admin Auth instance
 * @param logger - Firebase Functions logger for logging user creation events
 * @param params - Object containing user details
 * @param params.email - Email address for the new user
 * @param params.name - Display name for the new user
 * @returns A Promise that resolves to the UserRecord (existing or newly created)
 *
 * @example
 * ```typescript
 * const user = await createAuthUserIfNotExists(auth, logger, {
 *   email: "user@example.com",
 *   name: "John Doe"
 * });
 * console.log("User UID:", user.uid);
 * ```
 */
export const createAuthUserIfNotExists = async (
  auth: import("firebase-admin").auth.Auth,
  logger: typeof import("firebase-functions").logger,
  { email, name }: { email: string; name: string }
): Promise<import("firebase-admin").auth.UserRecord> => {
  // Get existing user by email
  const existingUser = await getExistingAuthUserByEmail(auth, email);

  if (existingUser) {
    logger.info("Auth account already exists", {
      uid: existingUser.uid,
      email: email,
    });

    return existingUser;
  } else {
    // Generate random password
    const randomPassword =
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10) +
      Math.random().toString(36).slice(-10);

    // Create auth account
    const userRecord = await auth.createUser({
      displayName: name || undefined,
      email: email,
      password: randomPassword,
    });

    logger.info("Auth account created", {
      uid: userRecord.uid,
      email: email,
    });

    return userRecord;
  }
};

/**
 * Creates an admin user in both Firebase Auth and Firestore.
 * Creates an auth account if it doesn't exist, then adds the user to the admins collection.
 *
 * @param auth - Firebase Admin Auth instance
 * @param db - Firebase Admin Firestore instance
 * @param logger - Firebase Functions logger for logging admin creation events
 * @param params - Object containing admin user details
 * @param params.email - Email address for the admin user
 * @param params.name - Display name for the admin user
 * @param params.valid - Whether the admin account is valid/active
 * @returns A Promise that resolves when the admin user is created
 *
 * @example
 * ```typescript
 * await createAdminUser(auth, db, logger, {
 *   email: "admin@example.com",
 *   name: "Admin User",
 *   valid: true
 * });
 * ```
 */
export const createAdminUser = async (
  auth: import("firebase-admin").auth.Auth,
  db: import("firebase-admin").firestore.Firestore,
  logger: typeof import("firebase-functions").logger,
  { email, name, valid }: { email: string; name: string; valid: boolean }
) => {
  try {
    const userRecord = await createAuthUserIfNotExists(auth, logger, {
      email,
      name,
    });

    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    await db.collection("admins").doc(userRecord.uid).set({
      name,
      email,
      valid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info("Admin user created in Firestore", {
      uid: userRecord.uid,
      email: email,
    });
  } catch (error) {
    logger.error("Failed to create admin account", { error });
  }
};

/**
 * Creates an organization user in both Firebase Auth and Firestore.
 * Creates an auth account if it doesn't exist, then adds the user to the organization's users subcollection.
 *
 * @param auth - Firebase Admin Auth instance
 * @param db - Firebase Admin Firestore instance
 * @param logger - Firebase Functions logger for logging user creation events
 * @param params - Object containing organization user details
 * @param params.oid - Organization ID where the user will be added
 * @param params.email - Email address for the user
 * @param params.name - Display name for the user
 * @param params.valid - Whether the user account is valid/active
 * @returns A Promise that resolves when the organization user is created
 *
 * @example
 * ```typescript
 * await createOrgUser(auth, db, logger, {
 *   oid: "org123",
 *   email: "user@example.com",
 *   name: "John Doe",
 *   valid: true
 * });
 * ```
 */
export const createOrgUser = async (
  auth: import("firebase-admin").auth.Auth,
  db: import("firebase-admin").firestore.Firestore,
  logger: typeof import("firebase-functions").logger,
  {
    oid,
    email,
    name,
    valid,
  }: { oid: string; email: string; name: string; valid: boolean }
) => {
  try {
    const userRecord = await createAuthUserIfNotExists(auth, logger, {
      email,
      name,
    });

    await auth.setCustomUserClaims(userRecord.uid, { [oid]: true });

    await db
      .collection("orgs")
      .doc(oid)
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        valid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    logger.info("User created in Firestore", {
      oid,
      uid: userRecord.uid,
      email,
    });
  } catch (error) {
    logger.error("Failed to create user account", { error });
  }
};

export const updateCustomUserClaims = async (
  auth: import("firebase-admin").auth.Auth,
  db: import("firebase-admin").firestore.Firestore,
  uid?: string
): Promise<void> => {
  if (!uid) {
    throw new Error("No UID provided for updating user claims");
  }

  await auth.getUser(uid); // Verify user exists

  const admin = await db.collection("admins").doc(uid).get();
  await auth.setCustomUserClaims(uid, {
    admin: admin.exists && admin.data()?.valid,
  });

  const orgs = await db.collection("orgs").get();
  await Promise.all(
    orgs.docs.map(async (org) => {
      const user = await db
        .collection("orgs")
        .doc(org.id)
        .collection("users")
        .doc(uid)
        .get();

      await auth.setCustomUserClaims(uid, {
        [org.id]: user.exists && user.data()?.valid,
      });

      const managers = await db
        .collection("orgs")
        .doc(org.id)
        .collection("groups")
        .doc("managers")
        .get();

      await auth.setCustomUserClaims(uid, {
        [`${org.id}.manager`]:
          managers.exists && managers.data()?.members?.includes(uid),
      });
    })
  );
};
