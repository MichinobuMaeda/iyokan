import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import Link from "next/link";
import { getAdmins, getOrgs, getProviders } from "@/app/_server/firestore";
import * as E from "fp-ts/Either";
import SvgAdd from "./_components/SvgAdd";

export default async function Home() {
  const { auth, db } = await getServerApp();
  requireServerAuth(auth);

  // Fetch admins
  const adminsResult = await getAdmins(db);
  let adminsError: string | undefined;
  const admins = E.isRight(adminsResult)
    ? adminsResult.right
    : (() => {
        adminsError = adminsResult.left.message;
        return [];
      })();

  // Fetch orgs
  const orgsResult = await getOrgs(db);
  let orgsError: string | undefined;
  const orgs = E.isRight(orgsResult)
    ? orgsResult.right
    : (() => {
        orgsError = orgsResult.left.message;
        return [];
      })();

  // Fetch providers
  const providersResult = await getProviders(db);
  let providersError: string | undefined;
  const providers = E.isRight(providersResult)
    ? providersResult.right
    : (() => {
        providersError = providersResult.left.message;
        return [];
      })();

  return (
    <main>
      <Link href="/o" className="button outlined" style={{ width: "100%" }}>
        <SvgAdd /> Add organization
      </Link>
      {orgsError ? (
        <p className="error">{orgsError}</p>
      ) : (
        <div className="list">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/o/${org.id}`}
              className="button text"
              style={{ width: "100%" }}
            >
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
        <SvgAdd /> Add admin
      </Link>
      {adminsError ? (
        <p className="error">{adminsError}</p>
      ) : (
        <div className="list">
          {admins.map((admin) => (
            <Link
              key={admin.id}
              href={`/admins/${admin.id}`}
              className="button text"
              style={{ width: "100%" }}
            >
              {admin.email}
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/providers"
        className="button outlined"
        style={{ width: "100%" }}
      >
        <SvgAdd /> Add provider
      </Link>
      {providersError ? (
        <p className="error">{providersError}</p>
      ) : (
        <div className="list">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              href={`/providers/${provider.id}`}
              className="button text"
              style={{ width: "100%" }}
            >
              {provider.type}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
