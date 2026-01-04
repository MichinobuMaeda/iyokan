import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import { getProvider } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import ProviderUpdateForm from "./ProviderUpdateForm";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireServerAuth(auth);

  const result = await getProvider(db, providerId);

  return (
    <main>
      <h2>{t("provider")}</h2>
      {E.isLeft(result) ? (
        <p className="error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <ProviderUpdateForm initialData={result.right} />
        </>
      )}
    </main>
  );
}
