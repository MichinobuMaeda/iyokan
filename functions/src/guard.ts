/**
 * Verifies that the request is authenticated
 * @param request - The callable request object
 * @throws {Error} Throws "unauthenticated" if auth or uid is missing
 */
export const guardAuth = async (
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<void> => {
  if (!request.auth?.uid) {
    throw new Error("unauthenticated");
  }
};

/**
 * Verifies that the authenticated user is a valid admin
 * @param db - Firestore instance
 * @param request - The callable request object
 * @throws {Error} Throws "unauthenticated" if not authenticated
 * @throws {Error} Throws "unknown user" if admin document doesn't exist
 * @throws {Error} Throws "forbidden" if admin is not valid
 */
export const guardAdmin = async (
  db: import("firebase-admin").firestore.Firestore,
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<void> => {
  await guardAuth(request);

  const uid = request.auth!.uid;
  const doc = await db.collection("admins").doc(uid!).get();

  if (!doc.exists) {
    throw new Error("unknown user");
  }

  if (!doc.data()?.valid) {
    throw new Error("forbidden");
  }
};

/**
 * Verifies that the authenticated user is a valid member of the organization
 * @param db - Firestore instance
 * @param request - The callable request object
 * @param oid - Organization ID
 * @throws {Error} Throws "unauthenticated" if not authenticated
 * @throws {Error} Throws "unknown user" if user document doesn't exist in org
 * @throws {Error} Throws "invalid user" if user is not valid
 */
export const guardOrgUsers = async (
  db: import("firebase-admin").firestore.Firestore,
  request: any,
  oid: string
): Promise<void> => {
  await guardAuth(request);

  const uid = request.auth.uid;
  const doc = await db
    .collection("orgs")
    .doc(oid)
    .collection("users")
    .doc(uid)
    .get();

  if (!doc.exists) {
    throw new Error("unknown user");
  }

  if (!doc.data()?.valid) {
    throw new Error("invalid user");
  }
};

/**
 * Verifies that the authenticated user is a manager of the organization
 * @param db - Firestore instance
 * @param request - The callable request object
 * @param oid - Organization ID
 * @throws {Error} Throws "unauthenticated" if not authenticated
 * @throws {Error} Throws "unknown user" if user is not a member of the org
 * @throws {Error} Throws "invalid user" if user is not valid
 * @throws {Error} Throws "unknown state" if managers group doesn't exist
 * @throws {Error} Throws "forbidden" if user is not in the managers group
 */
export const guardOrgManager = async (
  db: import("firebase-admin").firestore.Firestore,
  request: import("firebase-functions/v2/https").CallableRequest,
  oid: string
): Promise<void> => {
  await guardOrgUsers(db, request, oid);

  const uid = request.auth!.uid;
  const doc = await db
    .collection("orgs")
    .doc(oid)
    .collection("groups")
    .doc("managers")
    .get();

  if (!doc.exists) {
    throw new Error("unknown state");
  }

  if (!doc.data()?.members.includes(uid)) {
    throw new Error("forbidden");
  }
};
