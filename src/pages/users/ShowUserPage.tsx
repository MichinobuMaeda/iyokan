import { useParams, NavLink, redirect } from "react-router";
import { useAtom } from "jotai";

import { usersAtom, groupsAtom, dataStateAtom } from "../../lib/store";
import SvgPerson from "../../icons/SvgPerson";
import SvgAccountCircle from "../../icons/SvgAccountCircle";
import SvgBlock from "../../icons/SvgBlock";
import SvgGroup from "../../icons/SvgGroup";
import SvgEdit from "../../icons/SvgEdit";
import MetaItems from "../../components/MetaItems";

export default function ShowUserPage() {
  const params = useParams();
  const oid = params.orgId!;
  const [users] = useAtom(usersAtom);
  const user = () => users?.find((u) => u.id === params.userId);
  const [dataState] = useAtom(dataStateAtom);

  if (!user()) {
    throw redirect(`/o/${oid}/users`);
  }

  const [groups] = useAtom(groupsAtom);
  const belongs = () =>
    groups?.filter((g) => g.members.includes(user()!.id)) ?? [];

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          {user()!.valid ? (
            user()!.id === dataState?.uid ? (
              <SvgAccountCircle />
            ) : (
              <SvgPerson />
            )
          ) : (
            <SvgBlock />
          )}{" "}
          {user()!.name}
        </h2>
        {(dataState?.manager || dataState?.sys) && (
          <NavLink
            className="button icon sm text"
            to={`/o/${oid}/users/${user()!.id}/edit`}
          >
            <SvgEdit />
          </NavLink>
        )}
      </div>
      <div className="row wrap">
        {belongs().map((group) => (
          <NavLink
            key={group.id}
            to={`/o/${oid}/groups/${group.id}`}
            className="button outlined"
          >
            {group.valid ? <SvgGroup /> : <SvgBlock />} {group.name}
          </NavLink>
        ))}
      </div>
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems meta={user()!} />
        </>
      )}
    </main>
  );
}
