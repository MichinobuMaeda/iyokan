import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { guardAuth, guardAdmin, guardOrgManager } from "./guard.js";
import { setUpData as setUpData } from "./setup.js";
import {
  createAdminUser,
  createOrgUser,
  updateCustomUserClaims,
} from "./account.js";

const admin = initializeApp();
const auth = getAuth(admin);
const db = getFirestore(admin);

setGlobalOptions({ region: "asia-northeast1", maxInstances: 10 });

export const createAdmin = onCall({ timeoutSeconds: 60 }, async (request) => {
  try {
    await guardAdmin(db, request);
    return createAdminUser(auth, db, logger, request.data);
  } catch (error) {
    logger.error("Error creating admin:", error);
  }
});

export const createUser = onCall({ timeoutSeconds: 60 }, async (request) => {
  try {
    await guardOrgManager(db, request, request.data.oid);
  } catch (error) {
    try {
      await guardAdmin(db, request);
      return createOrgUser(auth, db, logger, request.data);
    } catch (error) {
      logger.error("Error creating user:", error);
    }
  }
});

export const updateUserClaims = onCall(
  { timeoutSeconds: 60 },
  async (request) => {
    try {
      await guardAuth(request);
      return updateCustomUserClaims(auth, db, request.data.uid);
    } catch (error) {
      logger.error("Error updating user claims:", error);
    }
  }
);

export const onServiceVersionDelete = onDocumentDeleted(
  "service/version",
  (event) => setUpData(auth, db, logger, event)
);
