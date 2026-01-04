import { cookies } from "next/headers";
import { ja, TranslationKey } from "./locales/ja";
import { en } from "./locales/en";

export type Locale = "ja" | "en";
type Translations = Record<TranslationKey, string>;

const translations: Record<Locale, Translations> = {
  ja,
  en,
};

/**
 * Get the current locale from cookies (server-side)
 * Falls back to Japanese if no locale is set
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value as Locale | undefined;

  if (locale && (locale === "ja" || locale === "en")) {
    return locale;
  }

  return "ja"; // Default locale
}

/**
 * Create a translation function for server components
 */
export async function getTranslations() {
  const locale = await getLocale();

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key;
  };

  return { t, locale };
}
