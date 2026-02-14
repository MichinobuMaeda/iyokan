import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { type RouteObject } from "react-router-dom";

import "./i18n/i18n";
import { listenAppState } from "./lib/app";
import { listenAuthState } from "./lib/auth";
import { subscribeConf } from "./lib/firestore";
import { setPrivileges } from "./lib/guard.ts";
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
    children: [
      {
        index: true,
        middleware: [setPrivileges([])],
        Component: InfoPage,
      },
      {
        path: "login",
        middleware: [setPrivileges(["guest"])],
        Component: LoginPage,
      },
      {
        path: "reset-password",
        middleware: [setPrivileges(["guest"])],
        Component: ResetPasswordPage,
      },
      {
        path: "me",
        children: [
          {
            path: "email",
            middleware: [setPrivileges(["user"])],
            Component: ChangeEmailPage,
          },
          {
            path: "password",
            middleware: [setPrivileges(["user"])],
            Component: ChangePasswordPage,
          },
        ],
      },
      {
        path: "conf",
        children: [
          {
            path: "edit",
            middleware: [setPrivileges(["sys"])],
            Component: EditConfPage,
          },
        ],
      },
      {
        path: "o",
        children: [
          {
            index: true,
            middleware: [setPrivileges(["user"])],
            Component: ListOrgsPage,
          },
          {
            path: "new",
            middleware: [setPrivileges(["sys"])],
            Component: NewOrgPage,
          },
          {
            path: ":oid",
            children: [
              {
                index: true,
                middleware: [setPrivileges(["user"])],
                Component: HomePage,
              },
              {
                path: "edit",
                middleware: [setPrivileges(["manager", "sys"])],
                Component: EditOrgPage,
              },
              {
                path: "users",
                children: [
                  {
                    index: true,
                    middleware: [setPrivileges(["user"])],
                    Component: ListUsersPage,
                  },
                  {
                    path: "new",
                    middleware: [setPrivileges(["manager", "sys"])],
                    Component: NewUserPage,
                  },
                  {
                    path: ":uid",
                    children: [
                      {
                        index: true,
                        middleware: [setPrivileges(["user"])],
                        Component: ShowUserPage,
                      },
                      {
                        path: "edit",
                        middleware: [setPrivileges(["manager", "sys"])],
                        Component: EditUserPage,
                      },
                    ],
                  },
                ],
              },
              {
                path: "groups",
                children: [
                  {
                    index: true,
                    middleware: [setPrivileges(["user"])],
                    Component: ListGroupsPage,
                  },
                  {
                    path: ":gid",
                    children: [
                      {
                        index: true,
                        middleware: [setPrivileges(["user"])],
                        Component: ShowGroupPage,
                      },
                      {
                        path: "edit",
                        middleware: [setPrivileges(["manager", "sys"])],
                        Component: EditGroupPage,
                      },
                    ],
                  },
                ],
              },
              {
                path: "providers",
                children: [
                  {
                    index: true,
                    middleware: [setPrivileges(["admin", "sys"])],
                    Component: ListProvidersPage,
                  },
                  {
                    path: "new",
                    middleware: [setPrivileges(["admin", "sys"])],
                    Component: NewProviderPage,
                  },
                  {
                    path: ":providerId",
                    children: [
                      {
                        index: true,
                        middleware: [setPrivileges(["admin", "sys"])],
                        Component: ShowProviderPage,
                      },
                      {
                        path: "edit",
                        middleware: [setPrivileges(["admin", "sys"])],
                        Component: EditProviderPage,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
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
