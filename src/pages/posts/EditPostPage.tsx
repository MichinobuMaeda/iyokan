import { useState, useRef } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Button } from "glassine-paper";

import { postsAtom, providersAtom } from "../../lib/store";
import { updateOrgPost } from "../../lib/firestore";
import { savePostedImage } from "../../lib/storage";
import { getFileExtension } from "../../lib/media";
import { type PostData, type PostStatus } from "../../types/Post";
import SvgArticle from "../../icons/SvgArticle";
import SvgAddPhotoAlternate from "../../icons/SvgAddPhotoAlternate";
import SvgRemove from "../../icons/SvgRemove";
import MetaItems from "../../components/MetaItems";
import Form from "../../components/Form";
import SvgProvider from "../../components/SvgProvider";
import SvgStatus from "../../components/SvgStatus";

export default function EditPostPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [posts] = useAtom(postsAtom);
  const [providers] = useAtom(providersAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const post = () => posts?.find((p) => p.id === params.postId);

  if (!post()) {
    throw redirect(`/o/${oid}/posts`);
  }

  const [formData, setFormData] = useState<PostData>({
    schedule: post()!.schedule || new Date(),
    title: post()!.title || "",
    message: post()!.message || "",
    link: post()!.link || "",
    files: post()!.files || [],
    providers: post()!.providers || [],
    status: post()!.status || "paused",
  });

  const errorTitle = () => (!formData.title ? t("required") : undefined);

  const toggleProvider = (providerId: string) => {
    const newProviders = formData.providers.includes(providerId)
      ? formData.providers.filter((p) => p !== providerId)
      : [...formData.providers, providerId];
    setFormData({ ...formData, providers: newProviders });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // Upload new image if selected
    let updatedFormData = formData;
    if (selectedFile) {
      const ext = getFileExtension(selectedFile.name);
      const fileName = `1.${ext}`;
      await savePostedImage(post()!.id, selectedFile, document);
      updatedFormData = { ...formData, files: [fileName] };
    }

    return updateOrgPost(oid, post()!.id, updatedFormData);
  };

  const formatDatetimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        returnPath={`/o/${oid}/posts/${post()!.id}`}
        returnOnSubmit
        validated={!errorTitle()}
      >
        <h2>
          <SvgArticle /> {t("editPost")}
        </h2>
        <MetaItems meta={post()!} />
        <div className="row">
          <TextField
            name="schedule"
            type="text"
            label={t("schedule")}
            value={formatDatetimeLocal(formData.schedule)}
            onChange={(e) =>
              setFormData({ ...formData, schedule: new Date(e.target.value) })
            }
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="title"
            type="text"
            label={t("title")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            supportingText={t("required")}
            errorMessage={errorTitle()}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="message"
            type="text"
            lineCount={6}
            label={t("message")}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="link"
            type="text"
            label={t("link")}
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {(selectedFile || formData.files[0]) && (
            <button
              type="button"
              className="button tonal sm"
              onClick={() => {
                setSelectedFile(null);
                setFormData({ ...formData, files: [] });
              }}
            >
              <SvgRemove />
              {t("removeImage")}
            </button>
          )}
          <button
            type="button"
            className="button outlined sm"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: selectedFile || formData.files[0] ? "auto" : "100%",
              flex: selectedFile || formData.files[0] ? 1 : undefined,
            }}
          >
            <SvgAddPhotoAlternate />
            {selectedFile
              ? `1.${getFileExtension(selectedFile.name)}`
              : formData.files[0]
                ? formData.files[0]
                : t("selectImage")}
          </button>
        </div>
        <div className="button-group">
          {providers
            ?.filter((p) => p.valid)
            .map((provider) => (
              <Button
                key={provider.id}
                type="select"
                label={provider.name}
                icon={<SvgProvider type={provider.type} />}
                checked={formData.providers.includes(provider.id)}
                size="sm"
                onClick={() => toggleProvider(provider.id)}
              />
            ))}
        </div>
        <div className="button-group">
          {(["canceled", "paused", "scheduled"] as PostStatus[]).map(
            (status) => (
              <Button
                key={status}
                type="select"
                icon={<SvgStatus type={status as PostStatus} />}
                checked={formData.status === status}
                size="sm"
                onClick={() => setFormData({ ...formData, status })}
              />
            )
          )}
        </div>
      </Form>
    </main>
  );
}
