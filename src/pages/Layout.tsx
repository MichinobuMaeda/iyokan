import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { NavDrawer, AppBar, Menu, type AppBarItemProps } from "glassine-paper";

import "../css/layout.css";
import { OID_SYSADMIN } from "../../functions/src/common";
import {
  localeAtom,
  dataStateAtom,
  orgsAtom,
  userPrivilegesAtom,
} from "../lib/store";
import { useGuard } from "../lib/guard";
import { useWindowWidth } from "../lib/useWindowWidth";
import SvgMenu from "../icons/SvgMenu";
import SvgClose from "../icons/SvgClose";
import SvgHome from "../icons/SvgHome";
import SvgLanguage from "../icons/SvgLanguage";
import SvgInfo from "../icons/SvgInfo";
import SvgAccountCircle from "../icons/SvgAccountCircle";
import SvgLogin from "../icons/SvgLogin";
import SvgDomain from "../icons/SvgDomain";
import SvgStickyNote from "../icons/SvgStickyNote ";
import SvgCognition from "../icons/SvgCognition";
import SvgArticle from "../icons/SvgArticle";
import SvgPerson from "../icons/SvgPerson";
import SvgGroup from "../icons/SvgGroup";
import SvgAppRegistration from "../icons/SvgAppRegistration";
import SvgAlternateEmail from "../icons/SvgAlternateEmail";
import SvgPassword from "../icons/SvgPassword";
import SvgLogout from "../icons/SvgLogout";

export default function Layout() {
  useGuard();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const location = useLocation();
  const [dataState] = useAtom(dataStateAtom);
  const [orgs] = useAtom(orgsAtom);
  const [, setUserPrivileges] = useAtom(userPrivilegesAtom);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const lg = () => windowWidth >= 1024;
  const drawerState = () =>
    dataState ? (lg() ? "visible" : drawerOpen ? "modal" : "hidden") : "hidden";
  const [locale, setLocale] = useAtom(localeAtom);
  const [menuOpen, setMenuOpen] = useState<"language" | "account" | null>(null);

  const locationIsInfo = () => location.pathname === "/";
  const locationIsLogin = () => location.pathname === "/login";
  const locationIsChangeEmail = () => location.pathname === "/me/email";
  const locationIsChangePassword = () => location.pathname === "/me/password";
  const locationIsOrgs = () =>
    dataState
      ? location.pathname.startsWith("/o") &&
        !location.pathname.startsWith(`/o/${dataState?.oid}`)
      : false;
  const locationIsHome = () =>
    dataState ? location.pathname === `/o/${dataState?.oid}` : false;
  const locationIs = (subPath: string) =>
    dataState
      ? location.pathname.startsWith(`/o/${dataState?.oid}/${subPath}`)
      : false;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  return (
    <div
      id="nav-drawer-layout"
      onClick={() => {
        setMenuOpen(null);
        setDrawerOpen(false);
      }}
    >
      <NavDrawer
        items={[
          !lg() && {
            leadingIcon: <SvgClose />,
            label: t("close"),
            onClick: () => setDrawerOpen(false),
          },
          {
            leadingIcon: <SvgHome />,
            label: t("home"),
            onClick: () => navigate(dataState ? `/o/${dataState.oid}` : "/"),
            active: locationIsHome(),
          },
          dataState && {
            leadingIcon: <SvgArticle />,
            label: t("posts"),
            onClick: () => navigate(`/o/${dataState!.oid}/posts`),
            active: locationIs("posts"),
          },
          dataState && {
            leadingIcon: <SvgStickyNote />,
            label: t("templates"),
            onClick: () => navigate(`/o/${dataState!.oid}/templates`),
            active: locationIs("templates"),
          },
          dataState && {
            leadingIcon: <SvgCognition />,
            label: t("generators"),
            onClick: () => navigate(`/o/${dataState!.oid}/generators`),
            active: locationIs("generators"),
          },
          dataState && {
            leadingIcon: <SvgPerson />,
            label: t("users"),
            onClick: () => navigate(`/o/${dataState!.oid}/users`),
            active: locationIs("users"),
          },
          dataState && {
            leadingIcon: <SvgGroup />,
            label: t("groups"),
            onClick: () => navigate(`/o/${dataState!.oid}/groups`),
            active: locationIs("groups"),
          },
          (dataState?.sys || dataState?.admin) && {
            leadingIcon: <SvgAppRegistration />,
            label: t("providers"),
            onClick: () => navigate(`/o/${dataState!.oid}/providers`),
            active: locationIs("providers"),
          },
          dataState?.sys && {
            leadingIcon: <SvgDomain />,
            label: t("organizations"),
            onClick: () => navigate("/o"),
            active: locationIsOrgs(),
          },
        ]}
        className={drawerState()}
        style={{ position: lg() ? "sticky" : "absolute" }}
      />
      <div id="nav-drawer-layout-right">
        <AppBar
          sticky={true}
          scrolled={true}
          items={
            [
              dataState &&
                !lg() && {
                  type: "button",
                  icon: <SvgMenu />,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDrawerOpen(true);
                  },
                },
              {
                type: "appLogo",
                icon: <img src="/logo.svg" alt="Logo" width={48} height={48} />,
              },
              {
                type: "title",
                title: t("appTitle"),
              },
              { type: "spacer" },
              {
                type: "button",
                icon: <SvgInfo />,
                onClick: () => navigate("/"),
                active: locationIsInfo(),
              },
              {
                type: "button",
                icon: <SvgLanguage />,
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  setMenuOpen(menuOpen === "language" ? null : "language");
                },
                active: menuOpen === "language",
              },
              {
                type: "button",
                icon: dataState ? <SvgAccountCircle /> : <SvgLogin />,
                onClick: dataState
                  ? (e: React.MouseEvent) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === "account" ? null : "account");
                    }
                  : () => navigate("/login"),
                active: menuOpen === "account" || locationIsLogin(),
              },
            ] as AppBarItemProps[]
          }
        />
        <Menu
          items={[
            {
              label: "English",
              onClick: () => setLocale("en"),
              active: locale === "en",
            },
            {
              label: "日本語",
              onClick: () => setLocale("ja"),
              active: locale === "ja",
            },
          ]}
          onClose={() => setMenuOpen(null)}
          style={
            menuOpen === "language" ? { display: "block" } : { display: "none" }
          }
        />
        <Menu
          items={[
            dataState?.oid !== OID_SYSADMIN &&
              (orgs?.length ?? 0) > 1 && {
                leadingIcon: <SvgDomain />,
                label: t("selectOrganization"),
                onClick: () => navigate("/o"),
              },
            {
              leadingIcon: <SvgAlternateEmail />,
              label: t("changeEmail"),
              onClick: () => navigate("/me/email"),
              active: locationIsChangeEmail(),
            },
            {
              leadingIcon: <SvgPassword />,
              label: t("changePassword"),
              onClick: () => navigate("/me/password"),
              active: locationIsChangePassword(),
            },
            { divider: true },
            {
              leadingIcon: <SvgLogout />,
              label: t("logout"),
              onClick: () => setUserPrivileges(null),
            },
          ]}
          onClose={() => setMenuOpen(null)}
          style={
            menuOpen === "account" ? { display: "block" } : { display: "none" }
          }
        />
        {dataState === undefined ? (
          <div style={{ paddingTop: "10vh", textAlign: "center" }}>
            Loading ...
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
