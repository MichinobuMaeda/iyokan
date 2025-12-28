import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setupData } from "./setup.js";

const admin = initializeApp();
const auth = getAuth(admin);
const db = getFirestore(admin);

const isTest =
  process.env.NODE_ENV === "test" || process.env.FUNCTIONS_EMULATOR === "true";

setGlobalOptions({ maxInstances: 10 });

export const onServiceVersionDelete = onDocumentDeleted(
  "service/version",
  (event) => setupData(auth, db, logger, isTest, event)
);
