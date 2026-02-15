import { useParams, NavLink, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";

import { postsAtom, dataStateAtom, providersAtom } from "../../lib/store";
import { getSavedImageUrl } from "../../lib/storage";
import SvgStatus from "../../components/SvgStatus";
import SvgEdit from "../../icons/SvgEdit";
import SvgProvider from "../../components/SvgProvider";
import MetaItems from "../../components/MetaItems";

export default function ShowPostPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [dataState] = useAtom(dataStateAtom);
  const [posts] = useAtom(postsAtom);
  const [providers] = useAtom(providersAtom);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const post = () => posts?.find((p) => p.id === params.postId);

  if (!post()) {
    throw redirect(`/o/${oid}/posts`);
  }

  const currentPost = post()!;
  const postId = currentPost.id;
  const postFiles = currentPost.files;

  useEffect(() => {
    const loadImage = async () => {
      if (postFiles && postFiles.length > 0) {
        try {
          const url = await getSavedImageUrl({
            id: postId,
            name: postFiles[0],
          });
          setImageUrl(url);
        } catch (error) {
          console.error("Failed to load image:", error);
        }
      }
    };
    loadImage();
  }, [postId, postFiles]);

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
      <div className="row">
        <h2 style={{ flexGrow: 1 }}>
          <SvgStatus type={post()!.status} />
          {formatDateTime(post()!.schedule)}
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
      {imageUrl && (
        <>
          <h3>{t("image")}</h3>
          <div className="row">
            <img
              src={imageUrl}
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
            {post()!
              .providers.filter((pid) =>
                providers?.some((p) => p.valid && p.id === pid)
              )
              .map((pid) => (
                <div key={pid} className="chip selected">
                  <SvgProvider
                    type={providers?.find((p) => p.id === pid)?.type}
                  />
                  {providers?.find((p) => p.id === pid)?.name || pid}
                </div>
              ))}
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
