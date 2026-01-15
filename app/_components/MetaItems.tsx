"use client";

import { Meta } from "@/app/_types/Meta";
import { useI18n } from "@/app/_i18n/context";
import { formatTimestamp } from "@/app/_lib/formatter";

export default function MetaItems({
  meta: { id, createdAt, updatedAt },
}: {
  meta: Meta;
}) {
  const { t } = useI18n();
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
