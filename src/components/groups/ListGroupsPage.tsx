import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { groupsAtom } from "../../lib/store";
import SvgGroup from "../../icons/SvgGroup";
import SvgBlock from "../../icons/SvgBlock";

export default function ListGroupsPage() {
  const { t } = useTranslation();
  const [groups] = useAtom(groupsAtom);
  const params = useParams();
  const oid = params.orgId!;

  return (
    <main>
      <h2>
        <SvgGroup /> {t("groups")}
      </h2>
      {groups?.map((group) => (
        <NavLink
          key={group.id}
          to={`/o/${oid}/groups/${group.id}`}
          className="button outlined"
          style={{ width: "100%" }}
        >
          {group.valid ? <SvgGroup /> : <SvgBlock />} {group.name}
        </NavLink>
      ))}
    </main>
  );
}
