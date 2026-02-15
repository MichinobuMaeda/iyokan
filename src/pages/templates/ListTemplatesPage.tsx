import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { templatesAtom, dataStateAtom } from "../../lib/store";
import SvgAdd from "../../icons/SvgAdd";
import SvgStickyNote from "../../icons/SvgStickyNote ";
import SvgBlock from "../../icons/SvgBlock";

export default function ListTemplatesPage() {
  const { t } = useTranslation();
  const [templates] = useAtom(templatesAtom);
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);

  return (
    <main>
      <h2>
        <SvgStickyNote /> {t("templates")}
      </h2>
      {(dataState?.manager || dataState?.admin || dataState?.sys) && (
        <NavLink
          to={`/o/${oid}/templates/new`}
          className="button tonal"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addTemplate")}
        </NavLink>
      )}
      {templates
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .map((template) => (
          <NavLink
            key={template.id}
            to={`/o/${oid}/templates/${template.id}`}
            className="button outlined"
            style={{ width: "100%" }}
          >
            {template.valid ? <SvgStickyNote /> : <SvgBlock />}
            {template.name}
          </NavLink>
        ))}
    </main>
  );
}
