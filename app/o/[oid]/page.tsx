import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import { getOrg } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import OrgUpdateForm from "./OrgUpdateForm";

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ oid: string }>;
}) {
  const { oid } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireServerAuth(auth);

  const result = await getOrg(db, oid);

  return (
    <main>
      <h2>{t("organization")}</h2>
      {E.isLeft(result) ? (
        <p className="message error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <OrgUpdateForm initialData={result.right} />
        </>
      )}
    </main>
  );
}
