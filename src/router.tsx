import { type RouteObject } from "react-router-dom";

import "./i18n/i18n.ts";
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
import NewTemplatePage from "./pages/templates/NewTemplatePage.tsx";
import ListTemplatesPage from "./pages/templates/ListTemplatesPage.tsx";
import ShowTemplatePage from "./pages/templates/ShowTemplatePage.tsx";
import EditTemplatePage from "./pages/templates/EditTemplatePage.tsx";
import ListGeneratorsPage from "./pages/generators/ListGeneratorsPage.tsx";
import NewGeneratorPage from "./pages/generators/NewGeneratorPage.tsx";
import ShowGeneratorPage from "./pages/generators/ShowGeneratorPage.tsx";
import EditGeneratorPage from "./pages/generators/EditGeneratorPage.tsx";
import ListPostsPage from "./pages/posts/ListPostsPage.tsx";
import NewPostPage from "./pages/posts/NewPostPage.tsx";
import ShowPostPage from "./pages/posts/ShowPostPage.tsx";
import EditPostPage from "./pages/posts/EditPostPage.tsx";

export const route: RouteObject[] = [
  {
    Component: Layout,
    children: [
      {
        index: true,
        middleware: [guardRoute([])],
        Component: InfoPage,
      },
      {
        path: "login",
        middleware: [guardRoute(["guest"])],
        Component: LoginPage,
      },
      {
        path: "reset-password",
        middleware: [guardRoute(["guest"])],
        Component: ResetPasswordPage,
      },
      {
        path: "me",
        children: [
          {
            path: "email",
            middleware: [guardRoute(["user"])],
            Component: ChangeEmailPage,
          },
          {
            path: "password",
            middleware: [guardRoute(["user"])],
            Component: ChangePasswordPage,
          },
        ],
      },
      {
        path: "conf",
        children: [
          {
            path: "edit",
            middleware: [guardRoute(["sys"])],
            Component: EditConfPage,
          },
        ],
      },
      {
        path: "o",
        children: [
          {
            index: true,
            middleware: [guardRoute(["user"])],
            Component: ListOrgsPage,
          },
          {
            path: "new",
            middleware: [guardRoute(["sys"])],
            Component: NewOrgPage,
          },
          {
            path: ":oid",
            children: [
              {
                index: true,
                middleware: [guardRoute(["user"])],
                Component: HomePage,
              },
              {
                path: "edit",
                middleware: [guardRoute(["manager", "sys"])],
                Component: EditOrgPage,
              },
              {
                path: "templates",
                children: [
                  {
                    index: true,
                    middleware: [guardRoute(["user"])],
                    Component: ListTemplatesPage,
                  },
                  {
                    path: "new",
                    middleware: [guardRoute(["user"])],
                    Component: NewTemplatePage,
                  },
                  {
                    path: ":templateId",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["user"])],
                        Component: ShowTemplatePage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["user"])],
                        Component: EditTemplatePage,
                      },
                    ],
                  },
                ],
              },
              {
                path: "generators",
                children: [
                  {
                    index: true,
                    middleware: [guardRoute(["user"])],
                    Component: ListGeneratorsPage,
                  },
                  {
                    path: "new",
                    middleware: [guardRoute(["user"])],
                    Component: NewGeneratorPage,
                  },
                  {
                    path: ":generatorId",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["user"])],
                        Component: ShowGeneratorPage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["user"])],
                        Component: EditGeneratorPage,
                      },
                    ],
                  },
                ],
              },
              {
                path: "posts",
                children: [
                  {
                    index: true,
                    middleware: [guardRoute(["user"])],
                    Component: ListPostsPage,
                  },
                  {
                    path: "new",
                    middleware: [guardRoute(["user"])],
                    Component: NewPostPage,
                  },
                  {
                    path: ":postId",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["user"])],
                        Component: ShowPostPage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["user"])],
                        Component: EditPostPage,
                      },
                    ],
                  },
                ],
              },
              {
                path: "users",
                children: [
                  {
                    index: true,
                    middleware: [guardRoute(["user"])],
                    Component: ListUsersPage,
                  },
                  {
                    path: "new",
                    middleware: [guardRoute(["manager", "sys"])],
                    Component: NewUserPage,
                  },
                  {
                    path: ":uid",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["user"])],
                        Component: ShowUserPage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["manager", "sys"])],
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
                    middleware: [guardRoute(["user"])],
                    Component: ListGroupsPage,
                  },
                  {
                    path: ":gid",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["user"])],
                        Component: ShowGroupPage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["manager", "sys"])],
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
                    middleware: [guardRoute(["admin", "sys"])],
                    Component: ListProvidersPage,
                  },
                  {
                    path: "new",
                    middleware: [guardRoute(["admin", "sys"])],
                    Component: NewProviderPage,
                  },
                  {
                    path: ":providerId",
                    children: [
                      {
                        index: true,
                        middleware: [guardRoute(["admin", "sys"])],
                        Component: ShowProviderPage,
                      },
                      {
                        path: "edit",
                        middleware: [guardRoute(["admin", "sys"])],
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
