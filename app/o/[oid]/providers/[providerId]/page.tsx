import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireAuth } from "@/app/_server/requireAuth";
import { getOrgProvider } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import ProviderUpdateForm from "./ProviderUpdateForm";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ oid: string; providerId: string }>;
}) {
  const { oid, providerId } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireAuth(auth);

  const result = await getOrgProvider(db, oid, providerId);

  return (
    <main>
      <h2>{t("provider")}</h2>
      {E.isLeft(result) ? (
        <p className="message error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <ProviderUpdateForm initialData={result.right} />
        </>
      )}
    </main>
  );
}
