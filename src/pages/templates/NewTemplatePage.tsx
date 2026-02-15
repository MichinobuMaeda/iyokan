import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { TextField, Switch } from "glassine-paper";

import { type TemplateData } from "../../types/Template";
import { createOrgTemplate } from "../../lib/firestore";
import SvgStickyNote from "../../icons/SvgStickyNote ";
import Form from "../../components/Form";

export default function NewTemplatePage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.oid!;
  const [formData, setFormData] = useState<TemplateData>({
    name: "",
    title: "",
    message: "",
    link: "",
    feed: "",
    category: "",
    valid: true,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => createOrgTemplate(oid, formData)}
        returnPath={`/o/${oid}/templates`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <SvgStickyNote /> {t("addTemplate")}
        </h2>
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
