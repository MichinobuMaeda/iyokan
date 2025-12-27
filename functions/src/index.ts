import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { setupData } from "./setup.js";

admin.initializeApp();

const isTest =
  process.env.NODE_ENV === "test" || process.env.FUNCTIONS_EMULATOR === "true";

setGlobalOptions({ maxInstances: 10 });

export const onServiceVersionDelete = onDocumentDeleted(
  "service/version",
  (event) => setupData(admin, logger, isTest, event)
);
