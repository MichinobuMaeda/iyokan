import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { postsAtom, providersAtom, dataStateAtom } from "../../lib/store";
import { formatLong } from "../../lib/formatter";
import SvgAdd2 from "../../icons/SvgAdd2";
import SvgArticle from "../../icons/SvgArticle";
import StatusIcons from "../../components/StatusIcons";
import PostProvidersState from "../../components/PostProvidersState";

export default function ListPostsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [posts] = useAtom(postsAtom);
  const [dataState] = useAtom(dataStateAtom);
  const [providers] = useAtom(providersAtom);

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
          <SvgAdd2 /> {t("addPost")}
        </NavLink>
      )}
      {posts?.map((post) => (
        <div className="post-list-item" key={post.id}>
          <NavLink key={post.id} to={`/o/${oid}/posts/${post.id}`}>
            <StatusIcons type={post.status} />
            {formatLong(post.schedule)}
            <PostProvidersState providers={providers ?? []} post={post} />
          </NavLink>
          <div>{`${post.title} ${post.message} ${post.link}`}</div>
        </div>
      ))}
    </main>
  );
}
