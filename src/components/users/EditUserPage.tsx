import { useState } from "react";
import { useParams, useNavigate, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField, Switch } from "glassine-paper";

import { usersAtom } from "../../lib/store";
import { updateOrgUser } from "../../lib/firestore";
import { type User } from "../../types/User";
import SvgPerson from "../../icons/SvgPerson";
import MetaItems from "../layout/MetaItems";
import Form from "../layout/Form";

export default function EditUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorName = () => (!formData.name ? t("required") : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);
    const result = await updateOrgUser(oid, user.id, formData);
    setPending(false);
    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
    } else {
      navigate(`/o/${oid}/users/${user.id}`);
    }
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        errorOnSave={errorOnSave}
        returnPath={`/o/${oid}/users/${user.id}`}
        disabled={pending || !!errorName()}
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
            disabled={pending}
            style={{ width: "100%" }}
          />
        </div>
        <label className="row">
          <Switch
            name="valid"
            checked={formData.valid}
            onClick={() => setFormData({ ...formData, valid: !formData.valid })}
            disabled={pending}
          />
          {t("active")}
        </label>
      </Form>
    </main>
  );
}
