import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { generatorsAtom, dataStateAtom } from "../../lib/store";
import SvgAdd from "../../icons/SvgAdd";
import SvgCognition from "../../icons/SvgCognition";
import SvgBlock from "../../icons/SvgBlock";

export default function ListGeneratorsPage() {
  const { t } = useTranslation();
  const [generators] = useAtom(generatorsAtom);
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);

  return (
    <main>
      <h2>
        <SvgCognition /> {t("generators")}
      </h2>
      {(dataState?.manager || dataState?.admin || dataState?.sys) && (
        <NavLink
          to={`/o/${oid}/generators/new`}
          className="button tonal"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addGenerator")}
        </NavLink>
      )}
      {generators
        ?.sort((a, b) => a.name.localeCompare(b.name))
        .map((generator) => (
          <NavLink
            key={generator.id}
            to={`/o/${oid}/generators/${generator.id}`}
            className="button outlined"
            style={{ width: "100%" }}
          >
            {generator.valid ? <SvgCognition /> : <SvgBlock />}
            {generator.name}
          </NavLink>
        ))}
    </main>
  );
}
