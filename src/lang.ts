import React from "react";
import AtomicState from "./atomic-state"

const initialLang = (
  globalThis.localStorage.getItem("Language") ??
  globalThis.navigator.language ??
  "en"
)
  .split("-")[0]
  .toLocaleLowerCase();

const atomicLanguage = new AtomicState(initialLang, {
  storage: {
    id: "Language",
    guard: isString,
  },
});

export function extractMultiLang(
  multilang: string | Record<string, string> | undefined | null,
  overrideLang?: string,
) {
  if (!multilang) return "";
  if (typeof multilang === "string") return multilang;

  const lang = overrideLang ?? atomicLanguage.value;
  const [firstLang] = Object.keys(multilang);
  return multilang[lang] ?? multilang[firstLang] ?? "";
}

export function useLang(): [string, (v: string) => void] {
  return atomicLanguage.useState();
}

export function useLangValue() {
  const [lang] = useLang();
  return lang;
}

export type Translation = Record<string, string | string[]>;

export type Translator<T extends Translation> = Readonly<
  {
    +readonly [key in keyof T]: string;
  } & {
    +readonly [key in keyof T as `${string & key}\$`]: (
      ...vars: string[]
    ) => string;
  } & {
    $lang: () => string,
    /**
     * Extract a text for the current language (or `overrideLang` is specified).
     * @param multilang Dictionary of textx per lang
     * @param overrideLang If specified use this language
     */
    $extract: (
      multilang: string | Record<string, string> | undefined | null,
      overrideLang?: string,
    ) => string;
  }
>;

export function useTanslatorGeneric<T extends Translation>(
  defaultTranslation: T,
  otherTranslations: Record<string, () => Promise<{ default: T }>>,
): Readonly<Translator<T>> {
  const [translation, setTranslation] = React.useState(defaultTranslation);
  const lang = useLangValue();
  React.useEffect(() => {
    const variations = getLangVariations(lang);
    for (const key of Object.keys(otherTranslations)) {
      if (variations.includes(key)) {
        otherTranslations[key]()
          .then((obj) => setTranslation(obj.default))
          .catch((ex) =>
            console.error(
              `Unable to load translation for language "${key}"!`,
              ex,
            ),
          );
        return;
      }
    }
    setTranslation(defaultTranslation);
  }, [lang, defaultTranslation, otherTranslations]);
  return makeTranslator<T>(translation);
}

function makeTranslator<T extends Translation>(dico: T): Translator<T> {
  const tr: Record<string, string | ((...vars: string[]) => string)> = {};
  for (const key of Object.keys(dico)) {
    tr[key] = Array.isArray(dico[key]) ? dico[key][0] : dico[key];
    tr[`${key}$`] = (...vars: string[]) => {
      let text = pick(dico[key]);
      vars.forEach((repl, index) => {
        text = text.replace(new RegExp(`\\$${index + 1}`), repl);
      });
      return text;
    };
  }
  tr.$extract = extractMultiLang;
  tr.$lang = (lang?: string) => {
    if (lang) atomicLanguage.value=lang
    return atomicLanguage.value
  }
  return tr as Translator<T>;
}

function pick(arr: string | string[]): string {
  if (!Array.isArray(arr)) return arr;

  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

/**
 * Returns languages veriations from the most specific to the less specific.
 * @example
 * ```
 * getLangVariations("sgn-BE-FR") === [
 *   "sgn-BE-FR",
 *   "sgn-BE",
 *   "sgn"
 * ]
 */
function getLangVariations(lang: string): string[] {
  const parts = lang.split("-");
  const versions: string[] = [];
  while (parts.length > 0) {
    versions.push(parts.join("-"));
    parts.pop();
  }
  return versions;
}

function isString(data: unknown): data is string {
    return typeof data === "string"
}