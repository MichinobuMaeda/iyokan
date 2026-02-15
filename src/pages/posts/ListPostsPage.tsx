import { useParams, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import { postsAtom, providersAtom, dataStateAtom } from "../../lib/store";
import SvgAdd from "../../icons/SvgAdd";
import SvgArticle from "../../icons/SvgArticle";
import SvgStatus from "../../components/SvgStatus";
import SvgProvider from "../../components/SvgProvider";

export default function ListPostsPage() {
  const { t } = useTranslation();
  const [posts] = useAtom(postsAtom);
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [providers] = useAtom(providersAtom);
  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };

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
            <SvgStatus type={post.status} />
            {formatDateTime(post.schedule)}
            {providers?.map((provider) => (
              <SvgProvider
                key={provider.id}
                type={provider.type}
                disabled={!post.providers.includes(provider.id)}
              />
            ))}
          </NavLink>
          <div>{`${post.title} ${post.message} ${post.link}`}</div>
        </div>
      ))}
    </main>
  );
}
