import { useTranslation } from "react-i18next";

import type { Meta } from "../types/Meta";
import { formatTimestamp } from "../lib/formatter";

export default function MetaItems({
  meta: { id, createdAt, updatedAt },
}: {
  meta: Meta;
}) {
  const { t } = useTranslation();
  return (
    <div className="param-list">
      <div className="param-row">
        <span className="param-name">{t("id")}:</span>
        {id}
      </div>
      <div className="param-row">
        <span className="param-name">{t("created")}:</span>
        {formatTimestamp(createdAt, "-")}
      </div>
      <div className="param-row">
        <span className="param-name">{t("updated")}:</span>
        {formatTimestamp(updatedAt, "-")}
      </div>
    </div>
  );
}
