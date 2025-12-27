export const getExistingAuthUserByEmail = async (
  admin: typeof import("firebase-admin"),
  email: string
): Promise<import("firebase-admin").auth.UserRecord | null> => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if ((error as any).code !== "auth/user-not-found") {
      throw error;
    }
  }
  return null;
};

export const createAuthUserIfNotExists = async (
  admin: typeof import("firebase-admin"),
  logger: typeof import("firebase-functions").logger,
  isTest: boolean,
  email: string,
  name: string
): Promise<import("firebase-admin").auth.UserRecord> => {
  // Get existing user by email
  const existingUser = await getExistingAuthUserByEmail(admin, email);

  if (existingUser) {
    logger.info("Auth account already exists", {
      uid: existingUser.uid,
      email: email,
    });

    return existingUser;
  } else {
    // Generate random password
    const randomPassword = isTest
      ? "P@ssword123"
      : Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);

    // Create auth account
    const userRecord = await admin.auth().createUser({
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
  admin: typeof import("firebase-admin"),
  logger: typeof import("firebase-functions").logger,
  isTest: boolean,
  email: string,
  name: string
) => {
  try {
    const userRecord = await createAuthUserIfNotExists(
      admin,
      logger,
      isTest,
      email,
      name
    );

    await admin.firestore().collection("admins").doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Admin user created in Firestore", {
      uid: userRecord.uid,
      email: email,
    });
  } catch (error) {
    logger.error("Failed to create auth account", { error });
  }
};
