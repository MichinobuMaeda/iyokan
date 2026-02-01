import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { dataStateAtom, orgsAtom } from "../lib/store";
import SvgHome from "../icons/SvgHome";
import SvgDomain from "../icons/SvgDomain";
import SvgLogin from "../icons/SvgLogin";

export default function InfoPage() {
  const { t } = useTranslation();
  const [dataState] = useAtom(dataStateAtom);
  const [orgs] = useAtom(orgsAtom);

  return (
    <main>
      {dataState ? (
        <div className="row wrap">
          {(orgs?.length ?? 0) > 1 && (
            <NavLink to="/o" className="button outlined">
              <SvgDomain /> {t("selectOrganization")}
            </NavLink>
          )}
          <NavLink to={`/o/${dataState.oid}`} className="button outlined">
            <SvgHome /> {t("returnToHome")}
          </NavLink>
        </div>
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
