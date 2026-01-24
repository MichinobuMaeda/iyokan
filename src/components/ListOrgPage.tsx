import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { getDefaultStore } from "jotai";

import { orgsAtom, authStateAtom } from "../lib/store";
import SvgAdd from "../icons/SvgAdd";
import SvgDomain from "../icons/SvgDomain";

export default function ListOrgPage() {
  const { t } = useTranslation();
  const store = getDefaultStore();
  const authState = store.get(authStateAtom);
  return (
    <main>
      {authState?.sys && (
        <NavLink
          to="/o/new"
          className="button outlined"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addOrganization")}
        </NavLink>
      )}
      {(store.get(orgsAtom) ?? []).map((org) => (
        <NavLink
          key={org.id}
          to={`/o/${org.id}`}
          className="button filled"
          style={{ width: "100%" }}
        >
          <SvgDomain /> {org.name}
        </NavLink>
      ))}
    </main>
  );
}
