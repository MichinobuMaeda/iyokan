import Link from "next/link";
import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireAuth } from "@/app/_server/requireAuth";
import { getOrg, getOrgUsers, getOrgProviders } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import MetaItems from "@/app/_components/MetaItems";
import SvgAdd from "@/app/_icons/SvgAdd";
import SvgBlock from "@/app/_icons/SvgBlock";
import SvgKey from "@/app/_icons/SvgKey";
import SvgPerson from "@/app/_icons/SvgPerson";
import OrgUpdateForm from "./OrgUpdateForm";

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ oid: string }>;
}) {
  const { oid } = await params;
  const { auth, db } = await getServerApp();
  const { t } = await getTranslations();
  requireAuth(auth);

  const result = await getOrg(db, oid);

  // Fetch users for this org
  const usersResult = await getOrgUsers(db, oid);
  let usersError: string | undefined;
  const users = E.isRight(usersResult)
    ? usersResult.right
    : (() => {
        usersError = t(usersResult.left);
        return [];
      })();

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
      <h2>{t("organization")}</h2>
      {E.isLeft(result) ? (
        <p className="message error">{t(result.left)}</p>
      ) : (
        <>
          <MetaItems meta={result.right} />
          <OrgUpdateForm initialData={result.right} />
        </>
      )}

      <h3>Providers</h3>
      <Link
        href={`/o/${oid}/providers`}
        className="button outlined"
        style={{ width: "100%" }}
      >
        <SvgAdd /> {t("addProvider")}
      </Link>
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
              {provider.valid ? <SvgKey /> : <SvgBlock />}
              {provider.name} ({provider.type})
            </Link>
          ))}
        </div>
      )}

      <h3>{t("users")}</h3>
      <Link
        href={`/o/${oid}/users`}
        className="button outlined"
        style={{ width: "100%" }}
      >
        <SvgAdd /> {t("addUser")}
      </Link>
      {usersError ? (
        <p className="message error">{usersError}</p>
      ) : (
        <div className="list">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/o/${oid}/users/${user.id}`}
              className="button text square"
              style={{ width: "100%" }}
            >
              {user.valid ? <SvgPerson /> : <SvgBlock />}
              {user.email}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
