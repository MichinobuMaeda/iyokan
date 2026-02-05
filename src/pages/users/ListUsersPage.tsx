import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { usersAtom, dataStateAtom } from "../../lib/store";
import SvgAdd from "../../icons/SvgAdd";
import SvgPerson from "../../icons/SvgPerson";
import SvgAccountCircle from "../../icons/SvgAccountCircle";
import SvgBlock from "../../icons/SvgBlock";

export default function ListUsersPage() {
  const { t } = useTranslation();
  const [users] = useAtom(usersAtom);
  const params = useParams();
  const oid = params.orgId!;
  const [dataState] = useAtom(dataStateAtom);

  return (
    <main>
      <h2>
        <SvgPerson /> {t("users")}
      </h2>
      {(dataState?.manager || dataState?.sys) && (
        <NavLink
          to={`/o/${oid}/users/new`}
          className="button tonal"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addUser")}
        </NavLink>
      )}
      {users
        ?.sort((a, b) => a.id.localeCompare(b.id))
        .map((user) => (
          <NavLink
            key={user.id}
            to={`/o/${oid}/users/${user.id}`}
            className="button outlined"
            style={{ width: "100%" }}
          >
            {user.valid ? (
              user.id === dataState?.uid ? (
                <SvgAccountCircle />
              ) : (
                <SvgPerson />
              )
            ) : (
              <SvgBlock />
            )}{" "}
            {user.name}
          </NavLink>
        ))}
    </main>
  );
}
