import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface I18nConfig<L extends string, Dict> {
  /** Supported locale codes, e.g. `["ko", "en", "ja"]`. */
  locales: readonly L[];
  /** Locale used when nothing else resolves. */
  defaultLocale: L;
  /** One dictionary per locale; all share the same shape (the `Dict` type). */
  dictionaries: Record<L, Dict>;
  /** Display names for the language switcher, e.g. `{ ko: "한국어", en: "English", ja: "日本語" }`. */
  labels?: Record<L, string>;
  /** localStorage key for the persisted choice. Default `"locale"`. */
  storageKey?: string;
}

export interface I18n<L extends string, Dict> {
  locale: L;
  setLocale: (locale: L) => void;
  /** The active locale's dictionary. */
  t: Dict;
  locales: readonly L[];
  labels: Record<L, string>;
}

export interface I18nProviderProps {
  children: ReactNode;
  /** Upstream preference (e.g. from auth/profile). Adopted only when no stored choice exists. */
  userLocale?: string;
}

export interface LanguageSwitcherProps {
  className?: string;
  "aria-label"?: string;
}

function safeGet(key: string): string | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / SSR — ignore */
  }
}

/**
 * Build a typed i18n instance bound to a fixed set of locales and dictionaries.
 * Framework-agnostic (plain React Context) — works in Vite + React and Next.js
 * (App Router: render `<I18nProvider>` inside a `"use client"` boundary).
 *
 *   const { I18nProvider, useI18n, LanguageSwitcher } = createI18n({
 *     locales: ["ko", "en", "ja"] as const,
 *     defaultLocale: "ko",
 *     dictionaries: { ko, en, ja },
 *     labels: { ko: "한국어", en: "English", ja: "日本語" },
 *   });
 *
 * `useI18n().t` is fully typed as the dictionary shape.
 */
export function createI18n<L extends string, Dict>(config: I18nConfig<L, Dict>) {
  const storageKey = config.storageKey ?? "locale";
  const labels =
    config.labels ??
    (Object.fromEntries(config.locales.map((l) => [l, String(l)])) as Record<L, string>);

  const isLocale = (v: unknown): v is L =>
    typeof v === "string" && (config.locales as readonly string[]).includes(v);

  function resolve(userLocale?: string): L {
    const stored = safeGet(storageKey);
    if (isLocale(stored)) return stored;
    if (userLocale) {
      if (isLocale(userLocale)) return userLocale;
      const base = userLocale.split("-")[0];
      if (isLocale(base)) return base;
    }
    if (typeof navigator !== "undefined" && navigator.language) {
      const nav = navigator.language.split("-")[0];
      if (isLocale(nav)) return nav;
    }
    return config.defaultLocale;
  }

  const Ctx = createContext<I18n<L, Dict>>({
    locale: config.defaultLocale,
    setLocale: () => {},
    t: config.dictionaries[config.defaultLocale],
    locales: config.locales,
    labels,
  });

  function I18nProvider({ children, userLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<L>(() => resolve(userLocale));

    const setLocale = useCallback((l: L) => {
      setLocaleState(l);
      safeSet(storageKey, l);
    }, []);

    useEffect(() => {
      try {
        document.documentElement.lang = locale;
      } catch {
        /* SSR — no document */
      }
    }, [locale]);

    // Adopt an upstream preference once it arrives (e.g. after auth loads),
    // but never override an explicit stored choice.
    const [seenUserLocale, setSeenUserLocale] = useState(userLocale);
    if (userLocale !== seenUserLocale) {
      setSeenUserLocale(userLocale);
      if (userLocale && !safeGet(storageKey)) {
        setLocaleState(resolve(userLocale));
      }
    }

    const value: I18n<L, Dict> = {
      locale,
      setLocale,
      t: config.dictionaries[locale],
      locales: config.locales,
      labels,
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useI18n(): I18n<L, Dict> {
    return useContext(Ctx);
  }

  function LanguageSwitcher({ className, "aria-label": ariaLabel }: LanguageSwitcherProps) {
    const { locale, setLocale, locales } = useI18n();
    return (
      <select
        className={className}
        value={locale}
        aria-label={ariaLabel ?? "Language"}
        onChange={(e) => setLocale(e.target.value as L)}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {labels[l] ?? l}
          </option>
        ))}
      </select>
    );
  }

  return { I18nProvider, useI18n, LanguageSwitcher };
}
