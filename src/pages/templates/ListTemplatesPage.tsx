import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { templatesAtom, dataStateAtom } from "../../lib/store";
import SvgStickyNote from "../../icons/SvgStickyNote ";
import SvgAddBox from "../../icons/SvgAddBox";
import SvgEdit from "../../icons/SvgEdit";
import SvgAdd2 from "../../icons/SvgAdd2";
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
          <SvgAddBox /> {t("addTemplate")}
        </NavLink>
      )}
      {templates
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .map((template) => (
          <div key={template.id} className="row" style={{ gap: "0.125em" }}>
            <NavLink
              key={template.id}
              to={`/o/${oid}/templates/${template.id}/edit`}
              className="button icon text"
            >
              <SvgEdit />
            </NavLink>
            {template.valid ? (
              <NavLink
                key={template.id}
                to={`/o/${oid}/posts/new/${template.id}`}
                className="button outlined"
                style={{ width: "100%" }}
              >
                <span
                  style={{
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {template.name}
                </span>
                <SvgAdd2 />
              </NavLink>
            ) : (
              <button
                key={template.id}
                className="button outlined"
                style={{ width: "100%" }}
                disabled
              >
                <SvgBlock />
                {template.name}
              </button>
            )}
          </div>
        ))}
    </main>
  );
}
