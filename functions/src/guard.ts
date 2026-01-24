import * as E from "fp-ts/lib/Either.js";

import { GID_ADMINS, GID_MANAGERS, OID_SYSADMIN } from "./common.js";
import {
  type Context,
  isOrganizationMember,
  isGroupMember,
} from "./firebase.js";

/**
 * Verifies that the request is authenticated.
 * @param request - The callable request object
 * @returns Either Right(void) if authenticated, or Left(Error) with "unauthenticated" if auth or uid is missing
 */
export const guardAuth = async (
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, void>> =>
  !request.auth?.uid
    ? E.left(new Error("unauthenticated"))
    : E.right(undefined);

/**
 * Verifies that the authenticated user is a valid member of the organization.
 * @param context - Context object containing Firebase Admin instances
 * @param request - The callable request object
 * @returns Either Right(void) if user is authenticated and a valid organization member,
 *          or Left(Error) with "unauthenticated" or "invalid user"
 */
export const guardOrgUsers = async (
  context: Context,
  request: import("firebase-functions/v2/https").CallableRequest,
  sys: boolean = false
): Promise<E.Either<Error, void>> =>
  guardAuth(request).then((res) =>
    E.isLeft(res)
      ? res
      : isOrganizationMember(context, {
          uid: request.auth!.uid,
          oid: sys ? OID_SYSADMIN : request.data.oid,
        }).then((res) =>
          E.isLeft(res)
            ? res
            : !res.right
              ? E.left(new Error("invalid user"))
              : E.right(undefined)
        )
  );

/**
 * Verifies that the authenticated user is a member of a specific group within the organization.
 * @param context - Context object containing Firebase Admin instances
 * @param request - The callable request object
 * @param oid - Organization ID
 * @param gid - Group ID to check membership in
 * @returns Either Right(void) if user is authenticated, a valid org member, and in the specified group,
 *          or Left(Error) with "unauthenticated", "invalid user", "unknown state", or "forbidden"
 */
export const guardOrgGroupMember = async (
  context: Context,
  request: import("firebase-functions/v2/https").CallableRequest,
  oid: string,
  gid: string
): Promise<E.Either<Error, void>> =>
  guardOrgUsers(context, request, oid === OID_SYSADMIN).then(async (res) =>
    E.isLeft(res)
      ? res
      : isGroupMember(context, { uid: request.auth!.uid, oid, gid }).then(
          (res) =>
            E.isLeft(res)
              ? res
              : !res.right
                ? E.left(new Error("forbidden"))
                : E.right(undefined)
        )
  );

/**
 * Verifies that the authenticated user is a system administrator.
 * @param context - Context object containing Firebase Admin instances
 * @param request - The callable request object
 * @returns Either Right(void) if user is a system administrator (member of "admin/admins" group),
 *          or Left(Error) with "unauthenticated", "invalid user", "unknown state", or "forbidden"
 */
export const guardSystemAdmin = async (
  context: Context,
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, void>> =>
  guardOrgGroupMember(context, request, OID_SYSADMIN, GID_ADMINS);

/**
 * Verifies that the authenticated user is a manager (either system admin or organization manager).
 * @param context - Context object containing Firebase Admin instances
 * @param request - The callable request object
 * @returns Either Right(void) if user is a system admin or organization manager,
 *          or Left(Error) with "unauthenticated", "invalid user", "unknown state", or "forbidden"
 */
export const guardManager = async (
  context: Context,
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, void>> =>
  guardSystemAdmin(context, request).then(async (res) =>
    E.isLeft(res)
      ? guardOrgGroupMember(
          context,
          request,
          request.data.oid,
          GID_MANAGERS
        ).then((res) => res)
      : res
  );

/**
 * Verifies that the authenticated user is an admin (either system admin or organization admin).
 * @param context - Context object containing Firebase Admin instances
 * @param request - The callable request object
 * @returns Either Right(void) if user is a system admin or organization admin,
 *          or Left(Error) with "unauthenticated", "invalid user", "unknown state", or "forbidden"
 */
export const guardAdmin = async (
  context: Context,
  request: import("firebase-functions/v2/https").CallableRequest
): Promise<E.Either<Error, void>> =>
  guardSystemAdmin(context, request).then(async (res) =>
    E.isLeft(res)
      ? guardOrgGroupMember(
          context,
          request,
          request.data.oid,
          GID_ADMINS
        ).then((res) => res)
      : res
  );
