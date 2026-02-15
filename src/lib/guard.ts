import { useEffect } from "react";
import {
  useNavigate,
  useParams,
  redirect,
  type Params,
  type MiddlewareFunction,
} from "react-router";
import { useAtom, getDefaultStore } from "jotai";

import { dataStateAtom, privilegesAtom, type Privilege } from "./store";
import type { UserState } from "../types/UserState";

/**
 * Determines if a redirect is needed based on user privileges and state.
 *
 * @param params - Route parameters from react-router
 * @param privileges - Array of required privileges for the current route
 * @param dataState - Current user state or null/undefined if not authenticated
 * @returns The path to redirect to, or undefined if access is allowed
 *
 * @remarks
 * - Returns undefined if no privileges are required
 * - Redirects to "/" if not authenticated and "guest" privilege is not included
 * - Redirects to user's org if accessing wrong org (mismatched oid)
 * - Checks for user, sys, admin, and manager privileges
 */
export const checkAccess = (
  params: Params<string>,
  privileges: Privilege[],
  dataState: UserState | null | undefined
): string | undefined =>
  privileges.length === 0
    ? undefined
    : !dataState
      ? privileges.includes("guest")
        ? undefined
        : "/"
      : params.oid && params.oid !== dataState.oid
        ? `/o/${dataState.oid}`
        : privileges.includes("user") ||
            (dataState.sys && privileges.includes("sys")) ||
            (dataState.admin && privileges.includes("admin")) ||
            (dataState.manager && privileges.includes("manager"))
          ? undefined
          : `/o/${dataState.oid}`;

/**
 * Creates a middleware function that sets privileges and handles route guarding.
 *
 * @param privileges - Array of privileges required for the route
 * @returns A middleware function for react-router
 *
 * @remarks
 * This middleware:
 * - Sets the privileges in the global store
 * - Checks if the current user has access based on privileges and state
 * - Redirects to an appropriate route if access is denied
 * - Logs privilege checks and redirects for debugging
 */
export const guardRoute = (privileges: Privilege[]): MiddlewareFunction => {
  return async ({ params }, next) => {
    const dataState = getDefaultStore().get(dataStateAtom);
    console.info("setPrivileges", { oid: params.oid, privileges, dataState });
    getDefaultStore().set(privilegesAtom, privileges);
    const redirectTo = checkAccess(params, privileges, dataState);
    if (redirectTo) {
      console.info("redirect", redirectTo);
      return redirect(redirectTo);
    }
    return next();
  };
};

/**
 * Custom hook to handle navigation guards based on user state.
 *
 * @remarks
 * This hook:
 * - Monitors changes to route params, privileges, and user state
 * - Automatically navigates to an appropriate route if access is denied
 * - Uses the guard logic to determine if redirection is needed
 * - Logs navigation decisions for debugging
 *
 * Should be called in protected route components to enforce access control.
 */
export function useGuard() {
  const navigate = useNavigate();
  const params = useParams();
  const [privileges] = useAtom(privilegesAtom);
  const [dataState] = useAtom(dataStateAtom);

  useEffect(() => {
    console.log("useGuard", { oid: params.oid, privileges, dataState });
    const redirectTo = checkAccess(params, privileges, dataState);
    if (redirectTo) {
      console.info("navigate", redirectTo);
      navigate(redirectTo);
    }
  }, [params, privileges, dataState, navigate]);
}
