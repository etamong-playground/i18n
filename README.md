> ⚠️ **Deprecated.** This standalone package is no longer used — its runtime i18n (KO+EN, system-default, EN fallback) now ships built into [`@etamong-playground/ui`](https://www.npmjs.com/package/@etamong-playground/ui) (`I18nProvider` / `useT` / `LanguageSwitcher`, ≥ v0.36.0), which also carries a one-time migration of the legacy `locale` storage key. Its former consumers (account, shortener) have migrated. See planning#818.

# @etamong-playground/i18n

> **About** — One of several small shared libraries used across a personal "fleet" of small apps (error handling · audit logging · encryption-at-rest · i18n · UI · …). Authored and maintained with [Claude Code](https://www.anthropic.com/claude-code) (Anthropic's agentic CLI). Each README documents the design rationale behind the library.
>
> **This is a public repository** — keep internal infrastructure details (hostnames, secret/Vault paths, private URLs, internal issue/MR references) out of code, comments, and commit messages.

Shared, framework-agnostic React i18n engine for etamong-playground apps. Plain React
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

Push a `vX.Y.Z` tag — CI publishes to GitHub Packages (`@etamong-playground/i18n`).

The tag must match `version` in `package.json` or the publish job fails.

## Acknowledgements

Built for [React](https://react.dev) (peer dependency, MIT).

## License

MIT — see [LICENSE](LICENSE).
