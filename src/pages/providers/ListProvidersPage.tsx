import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { providersAtom, dataStateAtom } from "../../lib/store";
import ProviderIcons from "../../components/ProviderIcons";
import SvgAdd from "../../icons/SvgAdd";
import SvgBlock from "../../icons/SvgBlock";

export default function ListProvidersPage() {
  const { t } = useTranslation();
  const [providers] = useAtom(providersAtom);
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);

  return (
    <main>
      <h2>
        <ProviderIcons type={null} /> {t("providers")}
      </h2>
      {(dataState?.manager || dataState?.sys) && (
        <NavLink
          to={`/o/${oid}/providers/new`}
          className="button tonal"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addProvider")}
        </NavLink>
      )}
      {providers
        ?.sort((a, b) => a.id.localeCompare(b.id))
        .map((provider) => (
          <NavLink
            key={provider.id}
            to={`/o/${oid}/providers/${provider.id}`}
            className="button outlined"
            style={{ width: "100%" }}
          >
            {provider.valid ? (
              <ProviderIcons type={provider.type} />
            ) : (
              <SvgBlock />
            )}
            {provider.name}
          </NavLink>
        ))}
    </main>
  );
}
