import { redirect } from "next/navigation";
import Link from "next/link";
import * as E from "fp-ts/Either";

import { requireAuth } from "@/app/_server/requireAuth";
import { getOrg, getOrgProviders } from "@/app/_server/firestore";
import { getServerApp } from "@/app/_server/firebase";
import { getTranslations } from "@/app/_i18n/server";
import ProviderCreateForm from "./ProviderCreateForm";

export default async function ProvidersPage({
  params,
}: {
  params: Promise<{ oid: string }>;
}) {
  const { auth, db } = await getServerApp();
  requireAuth(auth);
  const { t } = await getTranslations();

  const { oid } = await params;

  const orgResult = await getOrg(db, oid);
  if (E.isLeft(orgResult)) {
    redirect("/o");
  }

  const org = orgResult.right;

  // Fetch providers for this org
  const providersResult = await getOrgProviders(db, oid);
  let providersError: string | undefined;
  const providers = E.isRight(providersResult)
    ? providersResult.right
    : (() => {
        providersError = t(providersResult.left);
        return [];
      })();

  return (
    <main>
      <h1>{org.name}</h1>

      <h2>Providers</h2>
      {providersError ? (
        <p className="message error">{providersError}</p>
      ) : (
        <div className="list">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/o/${oid}/providers/${provider.id}`}
              className="button text square"
              style={{ width: "100%" }}
            >
              {provider.name} ({provider.type})
            </Link>
          ))}
        </div>
      )}

      <h2>Add Provider</h2>
      <ProviderCreateForm oid={oid} />
    </main>
  );
}
