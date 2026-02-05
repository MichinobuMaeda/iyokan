import { useParams, NavLink, redirect } from "react-router";
import { useAtom } from "jotai";

import { providerTypes } from "../../../functions/src/common";
import { providersAtom, dataStateAtom } from "../../lib/store";
import SvgAppRegistration from "../../icons/SvgAppRegistration";
import SvgBlock from "../../icons/SvgBlock";
import SvgEdit from "../../icons/SvgEdit";
import MetaItems from "../../components/MetaItems";

export default function ShowProviderPage() {
  const params = useParams();
  const oid = params.orgId!;
  const [dataState] = useAtom(dataStateAtom);
  const [providers] = useAtom(providersAtom);
  const provider = () => providers?.find((p) => p.id === params.providerId);
  const pt = providerTypes.find((pt) => pt.type === provider()?.type);

  if (!provider() || !pt) {
    throw redirect(`/o/${oid}/providers`);
  }

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          {provider()!.valid ? <SvgAppRegistration /> : <SvgBlock />}
          {provider()!.name}
        </h2>
        {(dataState?.admin || dataState?.sys) && (
          <NavLink
            className="button icon sm text"
            to={`/o/${oid}/providers/${provider()!.id}/edit`}
          >
            <SvgEdit />
          </NavLink>
        )}
      </div>
      <div className="param-list">
        <div className="param-row">
          <span className="param-name">type:</span> {provider()!.type}
        </div>
        {pt.params.map((param) => (
          <div className="param-row" key={param.key}>
            <span className="param-name">{param.key}:</span>
            {provider()!.params.find((p) => p.key === param.key)?.value}
          </div>
        ))}
      </div>
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems meta={provider()!} />
        </>
      )}
    </main>
  );
}
