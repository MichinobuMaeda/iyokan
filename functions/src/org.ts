import * as E from "fp-ts/lib/Either.js";
import { FieldValue } from "firebase-admin/firestore";

import { GID_ADMINS, GID_MANAGERS, CreateOrgData } from "./common.js";
import { type Context } from "./firebase.js";

export const createOrgAndGroups = async (
  context: Context,
  data: CreateOrgData
): Promise<E.Either<Error, string>> => {
  const { db, logger } = context;
  const { oid, name, desc, valid } = data;

  try {
    if (!oid || !name) {
      context.logger.error("Missing required org data", { oid, name });
      return E.left(new Error("Missing required org data"));
    }

    const orgRef = db.collection("orgs").doc(oid);

    await orgRef.set({
      oid,
      name,
      desc,
      valid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    logger.info("Org created", { oid, name });

    await orgRef.collection("groups").doc(GID_MANAGERS).set({
      name: "Managers",
      members: [],
      valid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    logger.info("Managers group created", { oid });

    await orgRef.collection("groups").doc(GID_ADMINS).set({
      name: "Admins",
      members: [],
      valid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    logger.info("Admins group created", { oid });

    return E.right(orgRef.id);
  } catch (error) {
    logger.error("Failed to create org", { error });
    return E.left(error as Error);
  }
};
