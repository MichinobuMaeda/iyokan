import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setUpData as setUpData } from "./setup.js";
import { createAdminUser } from "./account.js";

const admin = initializeApp();
const auth = getAuth(admin);
const db = getFirestore(admin);

setGlobalOptions({ region: "asia-northeast1", maxInstances: 10 });

export const createAdmin = onCall({ timeoutSeconds: 60 }, async (request) =>
  createAdminUser(auth, db, logger, request.data)
);

export const onServiceVersionDelete = onDocumentDeleted(
  "service/version",
  (event) => setUpData(auth, db, logger, event)
);
