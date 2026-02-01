import { useTranslation } from "react-i18next";

import type { Meta } from "../../types/Meta";
import { formatTimestamp } from "../../lib/formatter";

export default function MetaItems({
  meta: { id, createdAt, updatedAt },
}: {
  meta: Meta;
}) {
  const { t } = useTranslation();
  return (
    <div className="meta">
      <div>
        {t("id")}: {id}
      </div>
      <div>
        {t("created")}: {formatTimestamp(createdAt, "-")}
      </div>
      <div>
        {t("updated")}: {formatTimestamp(updatedAt, "-")}
      </div>
    </div>
  );
}
