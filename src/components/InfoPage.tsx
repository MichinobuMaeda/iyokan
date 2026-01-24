import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { getDefaultStore } from "jotai";

import { userStateAtom } from "../lib/store";
import SvgLogin from "../icons/SvgLogin";
import SvgDomain from "../icons/SvgDomain";

export default function InfoPage() {
  const { t } = useTranslation();
  const store = getDefaultStore();
  const userState = store.get(userStateAtom);

  return (
    <main>
      {userState ? (
        <NavLink to="/o" className="button filled" style={{ width: "100%" }}>
          <SvgDomain /> {t("selectOrganization")}
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className="button filled"
          style={{ width: "100%" }}
        >
          <SvgLogin /> {t("login")}
        </NavLink>
      )}
    </main>
  );
}
