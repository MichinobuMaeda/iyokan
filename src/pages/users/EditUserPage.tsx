import { useState } from "react";
import { useParams, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { TextField, Switch } from "glassine-paper";

import { usersAtom } from "../../lib/store";
import { updateOrgUser } from "../../lib/firestore";
import { type User } from "../../types/User";
import SvgPerson from "../../icons/SvgPerson";
import MetaItems from "../../components/MetaItems";
import Form from "../../components/Form";

export default function EditUserPage() {
  const { t } = useTranslation();
  const params = useParams();
  const oid = params.orgId!;
  const [users] = useAtom(usersAtom);
  const user = users?.find((u) => u.id === params.userId);

  if (!user) {
    throw redirect(`/o/${oid}/users`);
  }

  const [formData, setFormData] = useState<User>({
    id: user.id,
    name: user.name || "",
    valid: user.valid ?? true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
  const errorName = () => (!formData.name ? t("required") : undefined);

  return (
    <main>
      <Form
        onSubmit={() => updateOrgUser(oid, user.id, formData)}
        returnPath={`/o/${oid}/users/${user.id}`}
        returnOnSubmit
        validated={!errorName()}
      >
        <h2>
          <SvgPerson /> {t("editUser")}
        </h2>
        <MetaItems meta={user} />
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
        <label className="row">
          <Switch
            name="valid"
            value="on"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
