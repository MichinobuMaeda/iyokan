import { FieldValue } from "firebase-admin/firestore";

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
    logger.error("Failed to create auth account", { error });
  }
};
