"use client";

import { Meta } from "@/app/_types/Meta";
import { useI18n } from "@/app/_i18n/context";

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
        {t("created")}: {createdAt?.toISOString() ?? "-"}
      </div>
      <div>
        {t("updated")}: {updatedAt?.toISOString() ?? "-"}
      </div>
    </div>
  );
}
