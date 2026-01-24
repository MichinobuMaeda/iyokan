import { redirect, type MiddlewareFunction } from "react-router";
import { type RouteObject } from "react-router-dom";
import { getDefaultStore } from "jotai";

import { authStateAtom } from "./store.ts";
import { guard } from "./auth.ts";
import Layout from "../components/Layout.tsx";
import InfoPage from "../components/InfoPage.tsx";
import LoginPage from "../components/LoginPage.tsx";
import ResetPasswordPage from "../components/ResetPasswordPage.tsx";
import ListOrgPage from "../components/ListOrgPage.tsx";
import CreateOrgPage from "../components/CreateOrgPage.tsx";
import UpdateOrgPage from "../components/UpdateOrgPage.tsx";

export const guardRoute: MiddlewareFunction = ({ request }) => {
  const pathname = new URL(request.url).pathname;
  const userState = getDefaultStore().get(authStateAtom);
  console.info("request.url.pathname", pathname, "userState:", userState);
  const next = guard(pathname, userState);
  if (next) {
    console.info("redirect", next);
    return redirect(next);
  }
};

export const route: RouteObject[] = [
  {
    Component: Layout,
    middleware: [guardRoute],
    children: [
      { index: true, middleware: [guardRoute], Component: InfoPage },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "reset-password",
        Component: ResetPasswordPage,
      },
      {
        path: "o",
        Component: ListOrgPage,
      },
      {
        path: "o/new",
        Component: CreateOrgPage,
      },
      {
        path: "o/:orgId",
        Component: UpdateOrgPage,
      },
    ],
  },
];
