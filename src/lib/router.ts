import { type RouteObject } from "react-router-dom";

import { guardRoute } from "./guard";
import Layout from "../components/layout/Layout.tsx";
import InfoPage from "../components/InfoPage.tsx";
import LoginPage from "../components/account/LoginPage.tsx";
import ResetPasswordPage from "../components/account/ResetPasswordPage.tsx";
import ChangeEmailPage from "../components/account/ChangeEmailPage.tsx";
import ChangePasswordPage from "../components/account/ChangePasswordPage.tsx";
import ListOrgsPage from "../components/orgs/ListOrgsPage.tsx";
import NewOrgPage from "../components/orgs/NewOrgPage.tsx";
import HomePage from "../components/orgs/HomePage.tsx";
import EditOrgPage from "../components/orgs/EditOrgPage.tsx";
import ListUsersPage from "../components/users/ListUsersPage.tsx";
import NewUserPage from "../components/users/NewUserPage.tsx";
import ShowUserPage from "../components/users/ShowUserPage.tsx";
import EditUserPage from "../components/users/EditUserPage.tsx";
import ListGroupsPage from "../components/groups/ListGroupsPage.tsx";
import ShowGroupPage from "../components/groups/ShowGroupPage.tsx";
import EditGroupPage from "../components/groups/EditGroupPage.tsx";

export const route: RouteObject[] = [
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
    ],
  },
];
