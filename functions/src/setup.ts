import { FieldValue } from "firebase-admin/firestore";
import { createAdminUser } from "./account.js";

/**
 * Sets up initial data based on a Firestore event.
 * This function handles versioned data setup, creating admin users and updating
 * the setup document version incrementally.
 *
 * @param auth - Firebase Admin Auth instance for user management
 * @param db - Firebase Admin Firestore instance for database operations
 * @param logger - Firebase Functions logger for logging setup progress and errors
 * @param event - Optional Firestore event containing the setup document data
 * @returns A Promise that resolves when the setup is complete
 *
 * @example
 * ```typescript
 * await setUpData(auth, db, logger, firestoreEvent);
 * ```
 */
export const setUpData = async (
  auth: import("firebase-admin").auth.Auth,
  db: import("firebase-admin").firestore.Firestore,
  logger: typeof import("firebase-functions").logger,
  event?: import("firebase-functions/v2/firestore").FirestoreEvent<any>
) => {
  const snapshot = event?.data;
  if (!snapshot) {
    logger.info("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const version = data?.version ?? 0;

  switch (version) {
    case 0:
      const name = "Primary user";
      const email = data?.email;

      if (!email) {
        logger.error("No email provided for creating admin user");
        break;
      }

      try {
        db.collection("service")
          .doc("conf")
          .set({
            admin_url: process.env.ADMIN_URL || "",
            web_url: process.env.WEB_URL || "",
            desc: "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });

        await createAdminUser(auth, db, logger, {
          email,
          name,
          valid: true,
        });

        logger.info("Admin user created for version 0", { name, email });
      } catch (error) {
        logger.error("Failed to create admin user", { error });
        break;
      }
      // case 1:

      try {
        await snapshot.ref.set({
          version: version + 1,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        logger.error(`Failed to create document version: ${version + 1}`, {
          error,
        });
      }
    default:
      logger.info(`No action for this version: ${version}`);
  }
};
