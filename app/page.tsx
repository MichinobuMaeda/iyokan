import Link from "next/link";
import * as E from "fp-ts/Either";

import { getServerApp } from "@/app/_server/firebase";
import { requireAuth } from "@/app/_server/requireAuth";
import { getAdmins, getOrgs } from "@/app/_server/firestore";
import { getTranslations } from "@/app/_i18n/server";
import SvgAdd from "@/app/_icons/SvgAdd";
import SvgBlock from "@/app/_icons/SvgBlock";
import SvgDomain from "@/app/_icons/SvgDomain";
import SvgPerson from "@/app/_icons/SvgPerson";

export default async function Home() {
  const { auth, db } = await getServerApp();
  requireAuth(auth);
  const { t } = await getTranslations();

  // Fetch admins
  const adminsResult = await getAdmins(db);
  let adminsError: string | undefined;
  const admins = E.isRight(adminsResult)
    ? adminsResult.right
    : (() => {
        adminsError = t(adminsResult.left);
        return [];
      })();

  // Fetch orgs
  const orgsResult = await getOrgs(db);
  let orgsError: string | undefined;
  const orgs = E.isRight(orgsResult)
    ? orgsResult.right
    : (() => {
        orgsError = t(orgsResult.left);
        return [];
      })();

  return (
    <main>
      <Link href="/o" className="button outlined" style={{ width: "100%" }}>
        <SvgAdd /> {t("addOrganization")}
      </Link>
      {orgsError ? (
        <p className="message error">{orgsError}</p>
      ) : (
        <div className="list">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/o/${org.id}`}
              className="button text square"
              style={{ width: "100%" }}
            >
              {org.valid ? <SvgDomain /> : <SvgBlock />}
              {org.name}
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/admins"
        className="button outlined"
        style={{ width: "100%" }}
      >
        <SvgAdd /> {t("addAdmin")}
      </Link>
      {adminsError ? (
        <p className="message error">{adminsError}</p>
      ) : (
        <div className="list">
          {admins.map((admin) => (
            <Link
              key={admin.id}
              href={`/admins/${admin.id}`}
              className="button text square"
              style={{ width: "100%" }}
            >
              {admin.valid ? <SvgPerson /> : <SvgBlock />}
              {admin.email}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
