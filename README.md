> Canonical: https://github.com/etamong-playground/i18n | Mirror: https://git.m.etamong.com/etamong-playground/i18n (read-only)

# @etamong-playground/i18n

Shared, framework-agnostic React i18n engine for etamong-lab apps. Plain React
Context — works in Vite + React and Next.js (App Router, inside a `"use client"`
boundary). The package owns the **machinery**; each app owns its **dictionaries**.

## Install

```sh
pnpm add @etamong-playground/i18n
```

Resolving `@etamong-playground/*` from GitHub Packages requires the registry in `.npmrc`:

```
@etamong-playground:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<your-github-token>
```

## Usage

```ts
// app/i18n.ts
import { createI18n } from "@etamong-playground/i18n";
import ko from "./locales/ko";
import en from "./locales/en";

export const { I18nProvider, useI18n, LanguageSwitcher } = createI18n({
  locales: ["ko", "en"] as const,
  defaultLocale: "ko",
  dictionaries: { ko, en },
  labels: { ko: "한국어", en: "English" },
});

export type Dict = typeof ko; // dictionaries are checked against this shape
```

```tsx
// main.tsx
import { I18nProvider } from "./i18n";
<I18nProvider>{app}</I18nProvider>;

// any component
const { t, locale, setLocale } = useI18n(); // t is fully typed
<h1>{t.landing.title}</h1>;
<LanguageSwitcher className="lang" />;
```

`interpolate("{{n}} clicks", { n: 3 })` fills `{{name}}` placeholders.

### Locale resolution order

1. Stored choice (`localStorage["locale"]`, key configurable)
2. `userLocale` prop (e.g. from auth/profile) — exact or base match
3. `navigator.language` base match
4. `defaultLocale`

An explicit stored choice always wins; `userLocale` is adopted only when nothing
is stored yet.

## Release

Push a `vX.Y.Z` tag — CI publishes to GitHub Packages (`@etamong-playground/i18n`)
and Forgejo Packages (`@etamong-playground/i18n` at `git.m.etamong.com`).

The tag must match `version` in `package.json` or the publish job fails.
