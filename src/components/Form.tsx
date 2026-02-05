import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import * as E from "fp-ts/Either";
import { Button } from "glassine-paper";

import SvgSaveAlt from "../icons/SvgSaveAlt";
import SvgSend from "../icons/SvgSend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubmitFunction = () => Promise<E.Either<string, any>>;
export type SubmitLabel = "save" | "send";
const submitIcon = {
  save: <SvgSaveAlt />,
  send: <SvgSend />,
};

export default function Form({
  onSubmit,
  returnPath,
  returnOnSubmit = false,
  validated = true,
  submitLabel = "save",
  successMessage,
  errorMessage,
  children,
}: {
  onSubmit: SubmitFunction;
  returnPath: string;
  returnOnSubmit?: boolean;
  validated?: boolean;
  submitLabel?: SubmitLabel;
  successMessage?: string;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null | undefined>();

  const action = async () => {
    setError(undefined);
    setPending(true);
    const result = await onSubmit();
    setError(E.isLeft(result) ? result.left : null);
    setPending(false);

    if (returnOnSubmit && E.isRight(result)) {
      navigate(returnPath);
    }
  };

  return (
    <form className="column" action={action}>
      {children}
      <hr />
      {error === null && (
        <div className="message success">
          {successMessage ?? t("defaultSuccessMessage")}
        </div>
      )}
      {!!error && (
        <div className="message error">
          {errorMessage ?? t(error ?? "defaultErrorMessage")}
        </div>
      )}
      <div className="row right">
        <NavLink to={returnPath} className="button outlined sm">
          {t("cancel")}
        </NavLink>
        <Button
          type="submit"
          variant="filled"
          size="sm"
          disabled={!validated || pending}
          icon={submitIcon[submitLabel]}
          label={t(submitLabel)}
        />
      </div>
    </form>
  );
}
