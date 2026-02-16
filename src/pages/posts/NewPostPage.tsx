import { useState, useRef } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Button } from "glassine-paper";
import * as E from "fp-ts/Either";

import { type PostData, type PostStatus } from "../../types/Post";
import { formatPostId } from "../../lib/formatter";
import { createOrgPost } from "../../lib/firestore";
import { providersAtom } from "../../lib/store";
import { savePostedImage } from "../../lib/storage";
import { getFileExtension } from "../../lib/media";
import {
  validateSomePostText,
  validateSomePostProvider,
} from "../../lib/validators";
import SvgArticle from "../../icons/SvgArticle";
import SvgAddPhotoAlternate from "../../icons/SvgAddPhotoAlternate";
import SvgRemove from "../../icons/SvgRemove";
import Form from "../../components/Form";
import ProviderIcons from "../../components/ProviderIcons";
import StatusIcons from "../../components/StatusIcons";

export default function NewPostPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [providers] = useAtom(providersAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<PostData>({
    schedule: new Date(),
    title: "",
    message: "",
    link: "",
    files: [],
    providers: [],
    status: "scheduled",
  });

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
    const postId = formatPostId(new Date());

    // Upload image if selected
    let updatedFormData = formData;
    if (selectedFile) {
      const ext = getFileExtension(selectedFile.name);
      const fileName = `1.${ext}`;
      await savePostedImage(postId, selectedFile, document);
      updatedFormData = { ...formData, files: [fileName] };
    }

    return createOrgPost(oid, postId, updatedFormData);
  };

  const formatDatetimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const errorAnyPostText = () => {
    const result = validateSomePostText(formData);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  const errorAnyPostProvider = () => {
    const result = validateSomePostProvider(formData);
    return E.isLeft(result) ? t(result.left) : undefined;
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        returnPath={`/o/${oid}/posts`}
        returnOnSubmit
        validated={!errorAnyPostText() && !errorAnyPostProvider()}
      >
        <h2>
          <SvgArticle /> {t("addPost")}
        </h2>
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
        {!!errorAnyPostText() && (
          <div className="message error">{errorAnyPostText()}</div>
        )}
        <div className="row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {selectedFile && (
            <button
              type="button"
              className="button tonal sm"
              onClick={() => setSelectedFile(null)}
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
              width: selectedFile ? "auto" : "100%",
              flex: selectedFile ? 1 : undefined,
            }}
          >
            <SvgAddPhotoAlternate />
            {selectedFile
              ? `1.${getFileExtension(selectedFile.name)}`
              : t("selectImage")}
          </button>
        </div>
        {selectedFile && (
          <div className="row">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        )}
        <div className="button-group">
          {providers
            ?.filter((p) => p.valid)
            .map((provider) => (
              <Button
                key={provider.id}
                type="select"
                label={provider.name}
                icon={<ProviderIcons type={provider.type} />}
                checked={formData.providers.includes(provider.id)}
                size="sm"
                onClick={() => toggleProvider(provider.id)}
              />
            ))}
        </div>
        {!!errorAnyPostProvider() && (
          <div className="message error">{errorAnyPostProvider()}</div>
        )}
        <div className="button-group">
          {(["canceled", "paused", "scheduled"] as PostStatus[]).map(
            (status) => (
              <Button
                key={status}
                type="select"
                icon={<StatusIcons type={status as PostStatus} />}
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
