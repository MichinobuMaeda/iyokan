import { getServerApp } from "@/app/_server/firebase";
import { requireServerAuth } from "@/app/_server/auth";
import { getProvider } from "@/app/_server/firestore";
import { Provider } from "@/app/_types/Provider";
import * as E from "fp-ts/Either";
import ProviderUpdateForm from "./ProviderUpdateForm";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const { providerId } = await params;
  const { auth, db } = await getServerApp();
  requireServerAuth(auth);

  let error: string | undefined;
  let provider: Provider | undefined;

  const result = await getProvider(db, providerId);

  if (E.isLeft(result)) {
    error = result.left.message;
  } else {
    provider = result.right;
  }

  return provider ? (
    <main>
      <h2>Provider</h2>
      <div className="meta">
        <div>ID: {provider.id}</div>
        <div>Created: {provider.createdAt?.toISOString() ?? "-"}</div>
        <div>Updated: {provider.updatedAt?.toISOString() ?? "-"}</div>
      </div>
      <ProviderUpdateForm
        providerId={providerId}
        initialData={{
          type: provider.type,
          name: provider.name,
          params: provider.params,
          valid: provider.valid,
        }}
      />
    </main>
  ) : (
    <main>
      <h2>Provider Details</h2>
      <p className="error">{error}</p>
    </main>
  );
}
