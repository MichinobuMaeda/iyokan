import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import { getAdmin } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import AdminUpdateForm from "./AdminUpdateForm";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireServerAuth(auth);

  const result = await getAdmin(db, adminId);

  return (
    <main>
      <h2>{t("admin")}</h2>
      {E.isLeft(result) ? (
        <p className="message error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <AdminUpdateForm initialData={result.right} />
        </>
      )}
    </main>
  );
}
