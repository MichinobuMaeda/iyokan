import { useParams, NavLink, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { postsAtom, dataStateAtom, providersAtom } from "../../lib/store";
import StatusIcons from "../../components/StatusIcons";
import SvgEdit from "../../icons/SvgEdit";
import PostProvidersState from "../../components/PostProvidersState";
import MetaItems from "../../components/MetaItems";
import { formatLong } from "../../lib/formatter";
import { useImageUrl } from "../../lib/storage";

export default function ShowPostPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [posts] = useAtom(postsAtom);
  const [providers] = useAtom(providersAtom);
  const post = () => posts?.find((p) => p.id === params.postId);
  const imageUrls = useImageUrl(params.postId, post()?.files);

  if (!post()) {
    throw redirect(`/o/${oid}/posts`);
  }

  return (
    <main>
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          <StatusIcons type={post()!.status} />
          {formatLong(post()!.schedule)}
        </h2>
        <NavLink
          className="button icon sm text"
          to={`/o/${oid}/posts/${post()!.id}/edit`}
        >
          <SvgEdit />
        </NavLink>
      </div>
      {post()!.title && (
        <>
          <h3>{t("title")}</h3>
          <div className="row">{post()!.title}</div>
        </>
      )}
      {post()!.message && (
        <>
          <h3>{t("message")}</h3>
          <div className="row" style={{ whiteSpace: "pre-wrap" }}>
            {post()!.message}
          </div>
        </>
      )}
      {post()!.link && (
        <>
          <h3>{t("link")}</h3>
          <div className="row">
            <a href={post()!.link} target="_blank" rel="noopener noreferrer">
              {post()!.link}
            </a>
          </div>
        </>
      )}
      {imageUrls && imageUrls.length > 0 && (
        <>
          <h3>{t("image")}</h3>
          <div className="row">
            <img
              src={imageUrls[0]}
              alt={post()!.title}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </>
      )}
      {post()!.providers.length > 0 && (
        <>
          <h3>{t("providers")}</h3>
          <div className="row wrap" style={{ gap: "0.5em" }}>
            <PostProvidersState
              providers={providers ?? []}
              post={post()!}
              withName
            />
          </div>
        </>
      )}
      {(dataState?.sys || dataState?.admin || dataState?.manager) && (
        <>
          <hr />
          <MetaItems meta={post()!} />
        </>
      )}
    </main>
  );
}
