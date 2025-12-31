import { FieldValue } from "firebase-admin/firestore";
import { createAdminUser } from "./account.js";

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
