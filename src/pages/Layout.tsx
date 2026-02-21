import { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router";
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
  templatesAtom,
  generatorsAtom,
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
import SvgSettings from "../icons/SvgSettings";
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
import SvgAdd2 from "../icons/SvgAdd2";

export default function Layout() {
  useGuard();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const location = useLocation();
  const [dataState] = useAtom(dataStateAtom);
  const [templates] = useAtom(templatesAtom);
  const [generators] = useAtom(generatorsAtom);
  const [orgs] = useAtom(orgsAtom);
  const [, setUserPrivileges] = useAtom(userPrivilegesAtom);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

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
  const isTemplate = () => templates?.some((t) => t.valid);
  const isGenerator = () => generators?.some((g) => g.valid);
  const showFab = () =>
    !!dataState &&
    location.pathname !== `/o/${dataState!.oid}/posts/new` &&
    !location.pathname.startsWith(`/o/${dataState!.oid}/posts/new/`);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  return (
    <div
      id="nav-drawer-layout"
      onClick={() => {
        setMenuOpen(null);
        setDrawerOpen(false);
        setFabOpen(false);
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
          (dataState?.sys || dataState?.manager) && {
            leadingIcon: <SvgSettings />,
            label: t("settings"),
            onClick: () => navigate(`/o/${dataState!.oid}/edit`),
            active: locationIs("edit"),
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
      {showFab() && (
        <>
          {isTemplate() || isGenerator() ? (
            fabOpen ? (
              <div className="fab-menu">
                {isTemplate() && (
                  <NavLink
                    className={`button sm tonal`}
                    to={`/o/${dataState!.oid}/templates`}
                  >
                    <SvgStickyNote /> {t("template")}
                  </NavLink>
                )}
                <NavLink
                  className={`button sm tonal`}
                  to={`/o/${dataState!.oid}/posts/new`}
                >
                  <SvgArticle /> {t("post")}
                </NavLink>
                <button
                  className={`fab primary-container sm closed`}
                  onClick={() => setFabOpen(false)}
                >
                  <SvgClose />
                </button>
              </div>
            ) : (
              <button
                className={`fab primary-container sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFabOpen(true);
                }}
              >
                <SvgAdd2 />
              </button>
            )
          ) : (
            <NavLink
              className="fab primary sm"
              to={`/o/${dataState!.oid}/posts/new`}
            >
              <SvgAdd2 />
            </NavLink>
          )}
        </>
      )}
    </div>
  );
}
