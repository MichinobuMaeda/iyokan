import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch } from "glassine-paper";

import { templatesAtom } from "../../lib/store";
import { updateOrgTemplate } from "../../lib/firestore";
import { type TemplateData } from "../../types/Template";
import SvgStickyNote from "../../icons/SvgStickyNote ";
import MetaItems from "../../components/MetaItems";
import Form from "../../components/Form";

export default function EditTemplatePage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [templates] = useAtom(templatesAtom);
  const template = () => templates?.find((t) => t.id === params.templateId);

  if (!template()) {
    throw redirect(`/o/${oid}/templates`);
  }

  const [formData, setFormData] = useState<TemplateData>({
    name: template()!.name || "",
    title: template()!.title || "",
    message: template()!.message || "",
    link: template()!.link || "",
    feed: template()!.feed || "",
    category: template()!.category || "",
    valid: template()!.valid ?? true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => updateOrgTemplate(oid, template()!.id, formData)}
        returnPath={`/o/${oid}/templates/${template()!.id}`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <SvgStickyNote /> {t("editTemplate")}
        </h2>
        <MetaItems meta={template()!} />
        <div className="row">
          <TextField
            name="name"
            type="text"
            label={t("name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            supportingText={t("required")}
            errorMessage={errorName()}
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
        <div className="row">
          <TextField
            name="feed"
            type="text"
            label={t("feed")}
            value={formData.feed}
            onChange={(e) => setFormData({ ...formData, feed: e.target.value })}
            style={{ width: "100%" }}
          />
        </div>
        <div className="row">
          <TextField
            name="category"
            type="text"
            label={t("category")}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="valid"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
