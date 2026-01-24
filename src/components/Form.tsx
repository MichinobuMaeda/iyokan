import type { FormEventHandler } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

import SvgSaveAlt from "../icons/SvgSaveAlt";

export default function Form({
  onSubmit,
  errorOnSave,
  returnPath,
  disabled = false,
  children,
}: {
  onSubmit: FormEventHandler;
  errorOnSave?: string;
  returnPath: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <form className="column" onSubmit={onSubmit}>
      {children}
      <hr />
      {errorOnSave && <div className="message error">{errorOnSave}</div>}
      <div className="row right">
        <NavLink to={returnPath} className="button outlined">
          {t("cancel")}
        </NavLink>
        <button type="submit" className="button filled" disabled={disabled}>
          <SvgSaveAlt /> {t("save")}
        </button>
      </div>
    </form>
  );
}
