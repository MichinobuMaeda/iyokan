import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import { getOrg } from "@/app/_server/firestore";
import * as E from "fp-ts/Either";
import OrgUpdateForm from "./OrgUpdateForm";

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ oid: string }>;
}) {
  const { oid } = await params;
  const { auth, db } = await getServerApp();
  requireServerAuth(auth);

  const result = await getOrg(db, oid);

  return (
    <main>
      <h2>Organization</h2>
      {E.isLeft(result) ? (
        <p className="error">{result.left.message}</p>
      ) : (
        <>
          <div className="meta">
            <div>ID: {result.right.id}</div>
            <div>Created: {result.right.createdAt?.toISOString() ?? "-"}</div>
            <div>Updated: {result.right.updatedAt?.toISOString() ?? "-"}</div>
          </div>
          <OrgUpdateForm
            oid={oid}
            initialData={{
              name: result.right.name,
              desc: result.right.desc,
              active: result.right.active,
            }}
          />
        </>
      )}
    </main>
  );
}
