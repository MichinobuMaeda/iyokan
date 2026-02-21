import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { OID_SYSADMIN } from "../../../functions/src/common";
import { orgsAtom, dataStateAtom, userPrivilegesAtom } from "../../lib/store";
import SvgAddBox from "../../icons/SvgAddBox";
import SvgDomain from "../../icons/SvgDomain";
import SvgHome from "../../icons/SvgHome";
import SvgBlock from "../../icons/SvgBlock";

export default function ListOrgsPage() {
  const { t } = useTranslation();
  const [orgs] = useAtom(orgsAtom);
  const [dataState] = useAtom(dataStateAtom);
  const [userPrivileges] = useAtom(userPrivilegesAtom);

  return (
    <main>
      <h2>
        <SvgDomain /> {t("organizations")}
      </h2>
      {dataState?.oid === OID_SYSADMIN && (
        <NavLink to="/o/new" className="button tonal" style={{ width: "100%" }}>
          <SvgAddBox /> {t("addOrganization")}
        </NavLink>
      )}
      {(orgs ?? [])
        .filter(
          (org) =>
            dataState?.oid === OID_SYSADMIN ||
            (Object.keys(userPrivileges ?? {}).includes(org.id) && org.valid)
        )
        .map((org) => (
          <NavLink
            key={org.id}
            to={`/o/${org.id}`}
            className="button outlined"
            style={{ width: "100%" }}
          >
            {org.valid ? (
              org.id === dataState?.oid ? (
                <SvgHome />
              ) : (
                <SvgDomain />
              )
            ) : (
              <SvgBlock />
            )}{" "}
            {org.name}
          </NavLink>
        ))}
    </main>
  );
}
