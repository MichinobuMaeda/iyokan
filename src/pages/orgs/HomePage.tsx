import { useParams, NavLink, redirect } from "react-router";
import { useAtom } from "jotai";

import { orgsAtom, dataStateAtom } from "../../lib/store";
import Md from "../../components/Md";
import MetaItems from "../../components/MetaItems";
import SvgHome from "../../icons/SvgHome";
import SvgEdit from "../../icons/SvgEdit";

export default function HomePage() {
  const [orgs] = useAtom(orgsAtom);
  const params = useParams();
  const org = () => orgs?.find((o) => o.id === params.orgId);
  const [dataState] = useAtom(dataStateAtom);
  if (!org()) {
    throw redirect("/");
  }

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          <SvgHome /> {org()!.name}
        </h2>
        {(dataState?.manager || dataState?.sys) && (
          <NavLink className="button icon sm text" to={`/o/${org()!.id}/edit`}>
            <SvgEdit />
          </NavLink>
        )}
      </div>
      {org()?.desc && <Md hardBreak={org()!.hardBreak}>{org()!.desc!}</Md>}
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems
            meta={{
              id: org()!.id,
              createdAt: org()!.createdAt,
              updatedAt: org()!.updatedAt,
            }}
          />
        </>
      )}
    </main>
  );
}
