"use client";

import { FormEventHandler } from "react";
import Link from "next/link";

import { useI18n } from "@/app/_i18n/context";
import SvgSaveAlt from "@/app/_icons/SvgSaveAlt";

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
  const { t } = useI18n();

  return (
    <form className="column" onSubmit={onSubmit}>
      {children}
      <hr />
      {errorOnSave && <div className="message error">{errorOnSave}</div>}
      <div className="row right">
        <Link href={returnPath} className="button outlined">
          {t("cancel")}
        </Link>
        <button type="submit" className="button filled" disabled={disabled}>
          <SvgSaveAlt /> {t("save")}
        </button>
      </div>
    </form>
  );
}
