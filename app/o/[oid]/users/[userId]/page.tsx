import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireAuth } from "@/app/_server/requireAuth";
import { getOrgUser } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import UserUpdateForm from "./UserUpdateForm";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ oid: string; userId: string }>;
}) {
  const { oid, userId } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireAuth(auth);

  const result = await getOrgUser(db, oid, userId);

  return (
    <main>
      <h2>{t("user")}</h2>
      {E.isLeft(result) ? (
        <p className="message error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <UserUpdateForm initialData={result.right} />
        </>
      )}
    </main>
  );
}
