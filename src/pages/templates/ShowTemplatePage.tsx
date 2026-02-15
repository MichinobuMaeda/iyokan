import { useParams, NavLink, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { templatesAtom, dataStateAtom } from "../../lib/store";
import SvgStickyNote from "../../icons/SvgStickyNote ";
import SvgBlock from "../../icons/SvgBlock";
import SvgEdit from "../../icons/SvgEdit";
import MetaItems from "../../components/MetaItems";

export default function ShowTemplatePage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [templates] = useAtom(templatesAtom);
  const template = () => templates?.find((t) => t.id === params.templateId);

  if (!template()) {
    throw redirect(`/o/${oid}/templates`);
  }

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          {template()!.valid ? <SvgStickyNote /> : <SvgBlock />}
          {template()!.name}
        </h2>
        {(dataState?.admin || dataState?.manager || dataState?.sys) && (
          <NavLink
            className="button icon sm text"
            to={`/o/${oid}/templates/${template()!.id}/edit`}
          >
            <SvgEdit />
          </NavLink>
        )}
      </div>
      <h3>{t("title")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {template()!.title}
      </div>
      <h3>{t("message")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {template()!.message}
      </div>
      <h3>{t("link")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {template()!.link}
      </div>
      <h3>{t("feed")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {template()!.feed}
      </div>
      <h3>{t("category")}</h3>
      <div className="row" style={{ whiteSpace: "pre-wrap" }}>
        {template()!.category}
      </div>
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems meta={template()!} />
        </>
      )}
    </main>
  );
}
