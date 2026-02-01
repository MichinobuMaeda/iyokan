import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { NavDrawer, AppBar, Menu, type AppBarItemProps } from "glassine-paper";

import "./layout.css";
import { OID_SYSADMIN } from "../../../functions/src/common";
import {
  localeAtom,
  dataStateAtom,
  orgsAtom,
  userPrivilegesAtom,
} from "../../lib/store";
// import { logout } from "../../lib/auth";
import { useGuard } from "../../lib/guard";
import { useWindowWidth } from "../../lib/useWindowWidth";
import SvgMenu from "../../icons/SvgMenu";
import SvgClose from "../../icons/SvgClose";
import SvgHome from "../../icons/SvgHome";
import SvgLanguage from "../../icons/SvgLanguage";
import SvgInfo from "../../icons/SvgInfo";
import SvgAccountCircle from "../../icons/SvgAccountCircle";
import SvgLogin from "../../icons/SvgLogin";
import SvgDomain from "../../icons/SvgDomain";
import SvgPerson from "../../icons/SvgPerson";
import SvgGroup from "../../icons/SvgGroup";
import SvgAlternateEmail from "../../icons/SvgAlternateEmail";
import SvgPassword from "../../icons/SvgPassword";
import SvgLogout from "../../icons/SvgLogout";

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
  const locationIsHome = () =>
    dataState ? location.pathname === `/o/${dataState?.oid}` : false;
  const locationIsUsers = () =>
    dataState
      ? location.pathname.startsWith(`/o/${dataState?.oid}/users`)
      : false;
  const locationIsGroups = () =>
    dataState
      ? location.pathname.startsWith(`/o/${dataState?.oid}/groups`)
      : false;
  const locationIsOrgs = () =>
    dataState
      ? location.pathname.startsWith("/o") &&
        !location.pathname.startsWith(`/o/${dataState?.oid}`)
      : false;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  return (
    <div
      id="nav-drawer-layout"
      onClick={() => {
        setMenuOpen(null);
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
            onClick: () => {
              setDrawerOpen(false);
              navigate(dataState ? `/o/${dataState.oid}` : "/");
            },
            active: locationIsHome(),
          },
          dataState && {
            leadingIcon: <SvgPerson />,
            label: t("users"),
            onClick: () => navigate(`/o/${dataState!.oid}/users`),
            active: locationIsUsers(),
          },
          dataState && {
            leadingIcon: <SvgGroup />,
            label: t("groups"),
            onClick: () => navigate(`/o/${dataState!.oid}/groups`),
            active: locationIsGroups(),
          },
          dataState?.sys && {
            leadingIcon: <SvgDomain />,
            label: t("organizations"),
            onClick: () => navigate("/o"),
            active: locationIsOrgs(),
          },
        ]}
        className={drawerState()}
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
                  onClick: () => setDrawerOpen(true),
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
              onClick: () => setUserPrivileges(undefined),
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
