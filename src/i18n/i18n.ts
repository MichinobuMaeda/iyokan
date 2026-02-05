import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./i18n-en";
import { ja } from "./i18n-ja";

export type TranslationKey = keyof typeof ja;

const resources = {
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "ja",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
