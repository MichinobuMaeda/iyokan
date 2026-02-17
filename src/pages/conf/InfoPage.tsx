import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { dataStateAtom, orgsAtom, confAtom } from "../../lib/store";
import Md from "../../components/Md";
import SvgHome from "../../icons/SvgHome";
import SvgDomain from "../../icons/SvgDomain";
import SvgLogin from "../../icons/SvgLogin";
import SvgSettingsApplications from "../../icons/SvgSettingsApplications";
import { OID_SYSADMIN } from "../../../functions/src/common";

export default function InfoPage() {
  const { t } = useTranslation();
  const [dataState] = useAtom(dataStateAtom);
  const [orgs] = useAtom(orgsAtom);
  const [conf] = useAtom(confAtom);

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
          {dataState?.oid === OID_SYSADMIN &&
            (dataState.manager || dataState.admin) && (
              <NavLink to="/conf/edit" className="button tonal">
                <SvgSettingsApplications /> {t("appSettings")}
              </NavLink>
            )}
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
      {conf?.desc && <Md hardBreak={conf!.hardBreak}>{conf!.desc!}</Md>}
    </main>
  );
}
