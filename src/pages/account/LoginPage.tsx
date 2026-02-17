import { useTranslation } from "react-i18next";

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
    </main>
  );
}
