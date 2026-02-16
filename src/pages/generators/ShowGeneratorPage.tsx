import { useParams, NavLink, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { generatorsAtom, dataStateAtom, providersAtom } from "../../lib/store";
import SvgCognition from "../../icons/SvgCognition";
import SvgBlock from "../../icons/SvgBlock";
import SvgEdit from "../../icons/SvgEdit";
import ProviderIcons from "../../components/ProviderIcons";
import MetaItems from "../../components/MetaItems";

export default function ShowGeneratorPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [generators] = useAtom(generatorsAtom);
  const [providers] = useAtom(providersAtom);
  const generator = () => generators?.find((g) => g.id === params.generatorId);

  if (!generator()) {
    throw redirect(`/o/${oid}/generators`);
  }

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          {generator()!.valid ? <SvgCognition /> : <SvgBlock />}
          {generator()!.name}
        </h2>
        {(dataState?.admin || dataState?.manager || dataState?.sys) && (
          <NavLink
            className="button icon sm text"
            to={`/o/${oid}/generators/${generator()!.id}/edit`}
          >
            <SvgEdit />
          </NavLink>
        )}
      </div>
      <h3>{t("source")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {generator()!.source}
      </div>
      <h3>{t("prompt")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {generator()!.prompt}
      </div>
      <h3>{t("providers")}</h3>
      <div className="row wrap" style={{ gap: "0.5em" }}>
        {generator()!
          .providers.filter((pid) =>
            providers?.some((p) => p.valid && p.id === pid)
          )
          .map((pid) => (
            <div key={pid} className="chip selected">
              <ProviderIcons
                type={providers?.find((p) => p.id === pid)?.type}
              />
              {providers?.find((p) => p.id === pid)?.name || pid}
            </div>
          ))}
      </div>
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems meta={generator()!} />
        </>
      )}
    </main>
  );
}
