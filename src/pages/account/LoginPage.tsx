import { useTranslation } from "react-i18next";
import { Button } from "glassine-paper";

import { signInWithGoogle } from "../../lib/auth";
import SvgLogin from "../../icons/SvgLogin";
import LoginEmailLinkForm from "./LoginEmailLinkForm";
import LoginPasswordForm from "./LoginPasswordForm";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <main>
      <h2>
        <SvgLogin /> {t("login")}
      </h2>
      <LoginEmailLinkForm />
      <LoginPasswordForm />
      <Button
        variant="filled"
        size="sm"
        label={t("loginWithGoogle")}
        onClick={() => signInWithGoogle()}
        style={{ width: "100%" }}
      />
    </main>
  );
}
