import * as E from "fp-ts/lib/Either.js";
import { setGlobalOptions } from "firebase-functions";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { Context } from "./firebase.js";
import { guardAuth, guardManager, guardSystemAdmin } from "./guard.js";
import { setUpData as setUpData } from "./setup.js";
import { createOrgAndGroups } from "./org.js";
import { createOrgUser, getUserPrivileges } from "./account.js";

const admin = initializeApp();
const auth = getAuth(admin);
const db = getFirestore(admin);
const context: Context = { auth, db, logger };

setGlobalOptions({ region: "asia-northeast1", maxInstances: 10 });

export const createOrg = onCall({ timeoutSeconds: 60 }, async (request) =>
  guardManager(context, request).then(async (res) =>
    E.isLeft(res)
      ? logger.error("Error creating org:", res.left)
      : createOrgAndGroups(context, request.data).then((res) =>
          E.isLeft(res)
            ? logger.error("Error creating org:", res.left)
            : res.right
        )
  )
);

/**
 * Firebase Cloud Function to create a new organization user.
 * Creates an auth account if it doesn't exist and adds the user to the organization's users subcollection.
 * Requires manager privileges to execute.
 *
 * @param request - Callable request containing user data
 * @param request.data.oid - Organization ID where the user will be added
 * @param request.data.email - Email address for the user
 * @param request.data.name - Display name for the user
 * @param request.data.valid - Whether the user account is valid/active
 * @returns User ID (uid) if successful, undefined if failed
 */
export const createUser = onCall({ timeoutSeconds: 60 }, async (request) =>
  guardSystemAdmin(context, request).then(async (res) =>
    E.isLeft(res)
      ? logger.error("Error creating user:", res.left)
      : createOrgUser(context, request.data).then((res) =>
          E.isLeft(res)
            ? logger.error("Error creating user:", res.left)
            : res.right
        )
  )
);

/**
 * Firebase Cloud Function to retrieve user privileges across all organizations.
 * Checks organization membership and manager/admin roles for the authenticated user.
 * Requires authentication to execute.
 *
 * @param request - Callable request containing user ID
 * @param request.data.uid - User ID for which to retrieve privileges
 * @returns Object mapping organization IDs to manager/admin flags if successful, undefined if failed
 */
export const getUserPrivs = onCall({ timeoutSeconds: 60 }, async (request) =>
  guardAuth(request).then(async (res) =>
    E.isLeft(res)
      ? logger.error("Error in auth guard:", res.left)
      : getUserPrivileges(context, request).then((res) =>
          E.isLeft(res)
            ? logger.error("Error getting user privileges:", res.left)
            : res.right
        )
  )
);

/**
 * Firebase Cloud Function triggered when a service version document is deleted.
 * Automatically sets up or updates data in response to the deletion event.
 *
 * @param event - Firestore document deletion event for service/version document
 */
export const onServiceVersionDelete = onDocumentDeleted(
  "service/version",
  (event) => setUpData(context, event)
);
