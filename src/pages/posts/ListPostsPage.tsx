import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { postsAtom, providersAtom, dataStateAtom } from "../../lib/store";
import { formatLong } from "../../lib/formatter";
import SvgAdd from "../../icons/SvgAdd";
import SvgArticle from "../../icons/SvgArticle";
import StatusIcons from "../../components/StatusIcons";
import ProviderIcons from "../../components/ProviderIcons";
import type { Post } from "../../types/Post";

export default function ListPostsPage() {
  const { t } = useTranslation();
  const [posts] = useAtom(postsAtom);
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [providers] = useAtom(providersAtom);

  const isError = (post: Post, providerId: string) =>
    post.errors?.some((e) => e.provider === providerId) ?? false;

  return (
    <main>
      <h2>
        <SvgArticle /> {t("posts")}
      </h2>
      {dataState && (
        <NavLink
          to={`/o/${oid}/posts/new`}
          className="button tonal"
          style={{ width: "100%" }}
        >
          <SvgAdd /> {t("addPost")}
        </NavLink>
      )}
      {posts?.map((post) => (
        <div className="post-list-item" key={post.id}>
          <NavLink key={post.id} to={`/o/${oid}/posts/${post.id}`}>
            <StatusIcons type={post.status} />
            {formatLong(post.schedule)}
            {providers?.map((provider) => (
              <ProviderIcons
                key={provider.id}
                type={provider.type}
                disabled={!post.providers.includes(provider.id)}
                error={isError(post, provider.id)}
              />
            ))}
          </NavLink>
          <div>{`${post.title} ${post.message} ${post.link}`}</div>
        </div>
      ))}
    </main>
  );
}
