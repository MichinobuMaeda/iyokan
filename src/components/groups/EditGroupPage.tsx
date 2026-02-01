import { useState } from "react";
import { useParams, useNavigate, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import * as E from "fp-ts/Either";
import { TextField, Checkbox, Switch } from "glassine-paper";

import { groupsAtom, usersAtom } from "../../lib/store";
import { updateOrgGroup } from "../../lib/firestore";
import { type Group } from "../../types/Group";
import SvgGroup from "../../icons/SvgGroup";
import MetaItems from "../layout/MetaItems";
import Form from "../layout/Form";

export default function EditGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const oid = params.orgId!;
  const [groups] = useAtom(groupsAtom);
  const group = groups?.find((g) => g.id === params.groupId);
  const [users] = useAtom(usersAtom) ?? [];

  if (!group) {
    throw redirect(`/o/${oid}/groups`);
  }

  const [formData, setFormData] = useState<Group>({
    id: group.id,
    name: group.name || "",
    members: group.members || [],
    valid: ["managers", "admins"].includes(group.id)
      ? true
      : (group.valid ?? true),
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  });
  const [pending, setPending] = useState(false);
  const [errorOnSave, setErrorOnSave] = useState<string | undefined>();

  const errorName = () => (!formData.name ? t("required") : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorOnSave(undefined);
    setPending(true);
    const result = await updateOrgGroup(oid, group.id, formData);
    setPending(false);
    if (E.isLeft(result)) {
      setErrorOnSave(t(result.left));
    } else {
      navigate(`/o/${oid}/groups/${group.id}`);
    }
  };

  const toggleMember = (uid: string) => {
    const members = formData.members.includes(uid)
      ? formData.members.filter((m) => m !== uid)
      : [...formData.members, uid];
    setFormData({ ...formData, members });
  };

  return (
    <main>
      <Form
        onSubmit={handleSubmit}
        errorOnSave={errorOnSave}
        returnPath={`/o/${oid}/groups/${group.id}`}
        disabled={pending || !!errorName()}
      >
        <h2>
          <SvgGroup /> {t("editGroup")}
        </h2>
        <MetaItems meta={group} />
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
        <fieldset style={{ width: "100%" }}>
          <legend>{t("members")}</legend>
          {users?.map((user) => (
            <label key={user.id} className="row">
              <Checkbox
                checked={formData.members.includes(user.id)}
                onClick={() => toggleMember(user.id)}
              />
              {user.name}
            </label>
          ))}
        </fieldset>
        {!["managers", "admins"].includes(group.id) && (
          <label className="row">
            <Switch
              name="valid"
              checked={formData.valid}
              onClick={() =>
                setFormData({ ...formData, valid: !formData.valid })
              }
              disabled={pending}
            />
            {t("active")}
          </label>
        )}
      </Form>
    </main>
  );
}
