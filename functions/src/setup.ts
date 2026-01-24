import * as E from "fp-ts/lib/Either.js";
import { FieldValue } from "firebase-admin/firestore";

import { GID_ADMINS, GID_MANAGERS, OID_SYSADMIN } from "./common.js";
import { type Context } from "./firebase.js";
import { createOrgAndGroups } from "./org.js";
import { createOrgUser } from "./account.js";

/**
 * Updates the system to version 1 by creating initial service configuration and admin user.
 * Only runs if the current version is 0 or not set.
 * @param context - Context object containing Firebase Admin instances
 * @param event - Optional Firestore event containing the setup document data
 * @returns Either Right(1) if upgrade to version 1 was successful, Right(null) if already at version 1 or higher,
 *          or Left(Error) if the upgrade fails
 */
export const updateToVersion1 = async (
  context: Context,
  event?: import("firebase-functions/v2/firestore").FirestoreEvent<any>
): Promise<E.Either<Error, number | null>> => {
  const { db, logger } = context;
  logger.info("Start: updateToVersion1()");
  const data = event?.data?.data();
  const version = data?.version ?? 0;

  if (version > 0) {
    logger.info("Skip: updateToVersion1()");
    return E.right(null);
  }

  const name = "Primary user";
  const email = data?.email;

  try {
    await db
      .collection("service")
      .doc("conf")
      .set({
        web_url: process.env.WEB_URL || "",
        desc: "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    const orgRef = db.collection("orgs").doc(OID_SYSADMIN);

    await createOrgAndGroups(context, {
      oid: OID_SYSADMIN,
      name: "Sys Admin",
      desc: "System Administrator Organization",
    });
    logger.info("Organization created", { oid: OID_SYSADMIN });

    const uid = await createOrgUser(context, {
      data: {
        oid: OID_SYSADMIN,
        email,
        name,
        valid: true,
      },
    } as any);

    if (E.isRight(uid)) {
      logger.info("Admin user created", { uid: uid.right, name, email });

      await orgRef
        .collection("groups")
        .doc(GID_MANAGERS)
        .update({
          members: [uid.right],
          updatedAt: FieldValue.serverTimestamp(),
        });
      logger.info("Managers group updated", { oid: OID_SYSADMIN });

      await orgRef
        .collection("groups")
        .doc(GID_ADMINS)
        .update({
          members: [uid.right],
          updatedAt: FieldValue.serverTimestamp(),
        });
      logger.info("Admins group updated", { oid: OID_SYSADMIN });
    }

    logger.info("End: updateToVersion1()");
    return E.right(1);
  } catch (error) {
    logger.error("Failed to create admin user", { error });
    return E.left(error as Error);
  }
};

/**
 * Updates the data version in the Firestore setup document.
 * @param context - Context object containing Firebase Admin instances
 * @param snapshot - Firestore document snapshot to update
 * @param version - New version number to set
 */
export const updateDataVersion = async (
  context: Context,
  snapshot: import("firebase-admin/firestore").DocumentSnapshot,
  version: number
): Promise<void> =>
  snapshot.ref
    .set({
      version: version,
      createdAt: FieldValue.serverTimestamp(),
    })
    .then(() => undefined)
    .catch((error) =>
      context.logger.error(`Failed to create document version: ${version}`, {
        error,
      })
    );

/**
 * Sets up initial data based on a Firestore event.
 * Handles versioned data setup, creating admin users and updating the setup document version incrementally.
 * @param context - Context object containing Firebase Admin instances
 * @param event - Optional Firestore event containing the setup document data
 */
export const setUpData = async (
  context: Context,
  event?: import("firebase-functions/v2/firestore").FirestoreEvent<any>
): Promise<void> =>
  updateToVersion1(context, event).then(async (res) =>
    E.isLeft(res)
      ? context.logger.error("Error during setup:", res.left)
      : res.right === null
        ? context.logger.info(
            `No action for this version: ${event?.data?.data().version}`
          )
        : await updateDataVersion(context, event!.data, res.right)
  );
