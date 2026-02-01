import { useParams, NavLink, redirect } from "react-router";
import { useAtom } from "jotai";

import { groupsAtom, usersAtom, dataStateAtom } from "../../lib/store";
import SvgGroup from "../../icons/SvgGroup";
import SvgPerson from "../../icons/SvgPerson";
import SvgBlock from "../../icons/SvgBlock";
import SvgEdit from "../../icons/SvgEdit";
import MetaItems from "../layout/MetaItems";

export default function ShowGroupPage() {
  const [groups] = useAtom(groupsAtom);
  const params = useParams();
  const oid = params.orgId!;
  const group = () => groups?.find((g) => g.id === params.groupId);
  const [users] = useAtom(usersAtom) ?? [];
  const [dataState] = useAtom(dataStateAtom);

  if (!group()) {
    throw redirect(`/o/${oid}/groups`);
  }

  const members = () =>
    users?.filter((user) => group()!.members.includes(user.id));

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          {group()!.valid ? <SvgGroup /> : <SvgBlock />} {group()!.name}
        </h2>
        {(dataState?.manager || dataState?.sys) && (
          <NavLink
            className="button icon text"
            to={`/o/${oid}/groups/${group()!.id}/edit`}
          >
            <SvgEdit />
          </NavLink>
        )}
      </div>
      {members()?.map((user) => (
        <NavLink
          key={user.id}
          to={`/o/${oid}/users/${user.id}`}
          className="button outlined"
          style={{ width: "100%" }}
        >
          {user.valid ? <SvgPerson /> : <SvgBlock />} {user.name}
        </NavLink>
      ))}
      {(dataState?.sys || dataState?.manager || dataState?.admin) && (
        <>
          <hr />
          <MetaItems meta={group()!} />
        </>
      )}
    </main>
  );
}
