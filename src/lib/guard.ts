import { useEffect } from "react";
import {
  useNavigate,
  useLocation,
  redirect,
  type MiddlewareFunction,
} from "react-router";
import { useAtom, getDefaultStore } from "jotai";

import { dataStateAtom } from "./store";
import type { UserState } from "../types/UserState";

export function guard(
  pathname: string,
  dataState: UserState | null | undefined
): string | undefined {
  const pathList = pathname.replace(/^\//, "").replace(/\/$/, "").split("/");

  if (["", "/"].includes(pathname)) {
    // Nothing to do
  } else if (pathList[0] === "me") {
    if (!dataState) {
      return "/";
    }
  } else if (["login", "reset-password"].includes(pathList[0])) {
    if (dataState) {
      return `/o/${dataState.oid}`;
    }
  } else if (pathList[0] === "o") {
    if (!dataState) {
      return "/";
    }
    if (pathList[1] === "new") {
      if (!dataState.sys) {
        return `/o/${dataState.oid}`;
      }
    } else if (pathList[1] !== dataState.oid && !dataState.sys) {
      return `/o/${dataState.oid}`;
    } else if (
      pathList[2] === "edit" &&
      !dataState.sys &&
      !dataState.manager &&
      !dataState.admin
    ) {
      return `/o/${dataState.oid}`;
    } else if (pathList[2] === "users") {
      if (pathList[3] === "new") {
        if (!dataState.sys && !dataState.manager) {
          return `/o/${dataState.oid}/users`;
        }
      } else if (
        pathList[4] === "edit" &&
        !dataState.sys &&
        !dataState.manager
      ) {
        return `/o/${dataState.oid}/users/${pathList[3]}`;
      }
    } else if (pathList[2] === "groups") {
      if (pathList[3] === "new") {
        return `/o/${dataState.oid}`;
      } else if (
        pathList[4] === "edit" &&
        !dataState.sys &&
        !dataState.manager
      ) {
        return `/o/${dataState.oid}/groups/${pathList[3]}`;
      }
    }
  } else {
    if (!dataState) {
      return "/";
    } else {
      return `/o/${dataState.oid}`;
    }
  }
}

/**
 * Middleware function for react-router to guard routes based on user authentication and authorization
 * @param request - The request object containing the URL to be checked
 * @returns Redirect response if guard fails, otherwise undefined to allow navigation
 */
export const guardRoute: MiddlewareFunction = ({ request }) => {
  const pathname = new URL(request.url).pathname;
  const dataState = getDefaultStore().get(dataStateAtom);
  console.info("request.url.pathname", pathname, "dataState:", dataState);
  const next = guard(pathname, dataState);
  if (next) {
    console.info("redirect", next);
    return redirect(next);
  }
};

/**
 * Custom hook to handle navigation guards based on user state
 */
export function useGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dataState] = useAtom(dataStateAtom);

  useEffect(() => {
    console.info(
      "location.pathname",
      location.pathname,
      "dataState:",
      dataState
    );
    const next = guard(location.pathname, dataState);
    if (next) {
      console.info("navigate", next);
      navigate(next);
    }
  }, [dataState, location, navigate]);
}
