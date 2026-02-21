import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import type { Meta } from "../types/Meta";
import { formatTimestamp } from "../lib/formatter";
import { templatesAtom, generatorsAtom } from "../lib/store";

export default function MetaItems({
  meta: {
    id,
    createdAt,
    updatedAt,
    template = null,
    generator = null,
    createdBy = null,
    updatedBy = null,
  },
}: {
  meta: Meta & {
    template?: string | null;
    generator?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
}) {
  const { t } = useTranslation();
  const [templates] = useAtom(templatesAtom);
  const [generators] = useAtom(generatorsAtom);
  const templateName = templates?.find((t) => t.id === template)?.name;
  const generatorName = generators?.find((g) => g.id === generator)?.name;

  return (
    <div className="param-list">
      <div className="param-row">
        <span className="param-name">{t("id")}:</span>
        {id}
      </div>
      {createdBy && (
        <div className="param-row">
          <span className="param-name">{t("createdBy")}:</span>
          {createdBy}
        </div>
      )}
      <div className="param-row">
        <span className="param-name">{t("created")}:</span>
        {formatTimestamp(createdAt, "-")}
      </div>
      {(updatedBy || createdBy) && (
        <div className="param-row">
          <span className="param-name">{t("updatedBy")}:</span>
          {updatedBy || "--"}
        </div>
      )}
      <div className="param-row">
        <span className="param-name">{t("updated")}:</span>
        {formatTimestamp(updatedAt, "--")}
      </div>
      {templateName && (
        <div className="param-row">
          <span className="param-name">{t("template")}:</span>
          {templateName}
        </div>
      )}
      {generatorName && (
        <div className="param-row">
          <span className="param-name">{t("generator")}:</span>
          {generatorName}
        </div>
      )}
    </div>
  );
}
