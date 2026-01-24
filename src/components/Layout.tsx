import { useState, useEffect, type CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { AppBar, Menu, type AppBarItemProps } from "glassine-paper";

import "./layout.css";
import { localeAtom, userStateAtom } from "../lib/store";
import { logout, guard } from "../lib/auth";
import SvgMenu from "../icons/SvgMenu";
import SvgMenuOpen from "../icons/SvgMenuOpen";
import SvgHome from "../icons/SvgHome";
import SvgLanguage from "../icons/SvgLanguage";
import SvgInfo from "../icons/SvgInfo";
import SvgAccountCircle from "../icons/SvgAccountCircle";
import SvgLogin from "../icons/SvgLogin";
import SvgDomain from "../icons/SvgDomain";
import SvgAlternateEmail from "../icons/SvgAlternateEmail";
import SvgPassword from "../icons/SvgPassword";
import SvgLogout from "../icons/SvgLogout";

export default function Layout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locale, setLocale] = useAtom(localeAtom);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langListOpen, setLangListOpen] = useState(false);
  const [userState] = useAtom(userStateAtom);

  const menuStyle = {
    display: "block",
    width: "16rem",
    position: "absolute",
    right: "0.5rem",
    top: "4.5rem",
  } as CSSProperties;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    console.info(
      "location.pathname",
      location.pathname,
      "userState:",
      userState
    );
    const next = guard(location.pathname, userState);
    if (next) {
      console.info("navigate", next);
      navigate(next);
    }
  }, [userState, location, navigate]);

  return (
    <div
      onClick={() => {
        setMenuOpen(false);
        setLangListOpen(false);
      }}
    >
      <AppBar
        sticky={true}
        scrolled={true}
        items={
          [
            userState
              ? {
                  type: "button",
                  icon: drawerOpen ? <SvgMenuOpen /> : <SvgMenu />,
                  onClick: () => setDrawerOpen(!drawerOpen),
                }
              : {},
            {
              type: "appLogo",
              icon: <img src="/logo.svg" alt="Logo" width={48} height={48} />,
            },
            {
              type: "title",
              title: t("appTitle"),
            },
            { type: "spacer" },
            userState
              ? {
                  type: "button",
                  icon: <SvgHome />,
                  onClick: () => navigate(`/o/${userState.oid}`),
                }
              : {},
            {
              type: "button",
              icon: <SvgInfo />,
              onClick: () => navigate("/"),
            },
            {
              type: "button",
              icon: <SvgLanguage />,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setLangListOpen(!langListOpen);
              },
            },
            {
              type: "button",
              icon: userState ? <SvgAccountCircle /> : <SvgLogin />,
              onClick: userState
                ? (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }
                : () => navigate("/login"),
            },
          ].filter((item) => !!item.type) as AppBarItemProps[]
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
        onClose={() => setLangListOpen(false)}
        style={langListOpen ? menuStyle : { display: "none" }}
      />
      <Menu
        items={[
          {
            label: t("selectOrganization"),
            onClick: () => navigate("/o"),
            leadingIcon: <SvgDomain />,
          },
          {
            label: t("changeEmail"),
            onClick: () => navigate("/me/email"),
            leadingIcon: <SvgAlternateEmail />,
          },
          {
            label: t("changePassword"),
            onClick: () => navigate("/me/password"),
            leadingIcon: <SvgPassword />,
          },
          { divider: true },
          {
            label: t("logout"),
            onClick: () => logout(),
            leadingIcon: <SvgLogout />,
          },
        ]}
        onClose={() => setMenuOpen(false)}
        style={menuOpen ? menuStyle : { display: "none" }}
      />
      {userState === undefined ? (
        <div style={{ paddingTop: "10vh", textAlign: "center" }}>
          Loading ...
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
