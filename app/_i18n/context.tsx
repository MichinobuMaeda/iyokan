"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { ja, TranslationKey } from "./locales/ja";
import { en } from "./locales/en";

type Locale = "ja" | "en";
type Translations = Record<TranslationKey, string>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Locale, Translations> = {
  ja,
  en,
};

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Try to load from cookie first (for SSR consistency)
    if (typeof window !== "undefined") {
      const cookieLocale = getCookie("locale") as Locale | undefined;
      if (cookieLocale && (cookieLocale === "ja" || cookieLocale === "en")) {
        return cookieLocale;
      }

      // Fallback to localStorage
      const savedLocale = localStorage.getItem("locale") as Locale | null;
      if (savedLocale && (savedLocale === "ja" || savedLocale === "en")) {
        return savedLocale;
      }
    }
    return "ja";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    setCookie("locale", newLocale);
  };

  // Sync cookie on mount
  useEffect(() => {
    setCookie("locale", locale);
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
