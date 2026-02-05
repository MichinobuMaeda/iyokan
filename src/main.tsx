import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { type RouteObject } from "react-router-dom";

import "./i18n/i18n";
import { listenAppState } from "./lib/app";
import { listenAuthState } from "./lib/auth";
import { subscribeConf } from "./lib/firestore";
import { guardRoute } from "./lib/guard.ts";
import Layout from "./pages/Layout.tsx";
import InfoPage from "./pages/conf/InfoPage.tsx";
import LoginPage from "./pages/account/LoginPage.tsx";
import ResetPasswordPage from "./pages/account/ResetPasswordPage.tsx";
import ChangeEmailPage from "./pages/account/ChangeEmailPage.tsx";
import ChangePasswordPage from "./pages/account/ChangePasswordPage.tsx";
import EditConfPage from "./pages/conf/EditConfPage.tsx";
import ListOrgsPage from "./pages/orgs/ListOrgsPage.tsx";
import NewOrgPage from "./pages/orgs/NewOrgPage.tsx";
import HomePage from "./pages/orgs/HomePage.tsx";
import EditOrgPage from "./pages/orgs/EditOrgPage.tsx";
import ListUsersPage from "./pages/users/ListUsersPage.tsx";
import NewUserPage from "./pages/users/NewUserPage.tsx";
import ShowUserPage from "./pages/users/ShowUserPage.tsx";
import EditUserPage from "./pages/users/EditUserPage.tsx";
import ListGroupsPage from "./pages/groups/ListGroupsPage.tsx";
import ShowGroupPage from "./pages/groups/ShowGroupPage.tsx";
import EditGroupPage from "./pages/groups/EditGroupPage.tsx";
import NewProviderPage from "./pages/providers/NewProviderPage.tsx";
import EditProviderPage from "./pages/providers/EditProviderPage.tsx";
import ShowProviderPage from "./pages/providers/ShowProviderPage.tsx";
import ListProvidersPage from "./pages/providers/ListProvidersPage.tsx";

const route: RouteObject[] = [
  {
    Component: Layout,
    middleware: [guardRoute],
    children: [
      { index: true, Component: InfoPage },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "reset-password",
        Component: ResetPasswordPage,
      },
      {
        path: "me/email",
        Component: ChangeEmailPage,
      },
      {
        path: "me/password",
        Component: ChangePasswordPage,
      },
      {
        path: "conf/edit",
        Component: EditConfPage,
      },
      {
        path: "o",
        Component: ListOrgsPage,
      },
      {
        path: "o/new",
        Component: NewOrgPage,
      },
      {
        path: "o/:orgId",
        Component: HomePage,
      },
      {
        path: "o/:orgId/edit",
        Component: EditOrgPage,
      },
      {
        path: "o/:orgId/users",
        Component: ListUsersPage,
      },
      {
        path: "o/:orgId/users/new",
        Component: NewUserPage,
      },
      {
        path: "o/:orgId/users/:userId",
        Component: ShowUserPage,
      },
      {
        path: "o/:orgId/users/:userId/edit",
        Component: EditUserPage,
      },
      {
        path: "o/:orgId/groups",
        Component: ListGroupsPage,
      },
      {
        path: "o/:orgId/groups/:groupId",
        Component: ShowGroupPage,
      },
      {
        path: "o/:orgId/groups/:groupId/edit",
        Component: EditGroupPage,
      },
      {
        path: "o/:orgId/providers",
        Component: ListProvidersPage,
      },
      {
        path: "o/:orgId/providers/new",
        Component: NewProviderPage,
      },
      {
        path: "o/:orgId/providers/:providerId",
        Component: ShowProviderPage,
      },
      {
        path: "o/:orgId/providers/:providerId/edit",
        Component: EditProviderPage,
      },
    ],
  },
];

listenAppState();
listenAuthState();
subscribeConf();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={createHashRouter(route)} />
  </StrictMode>
);
