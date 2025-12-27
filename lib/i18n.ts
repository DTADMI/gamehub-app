// Minimal i18n utility for client components (EN/FR, per-title namespaces)
// NOTE: Keep lightweight — no heavy runtime libs.
import rod_en from "../i18n/rite-of-discovery/en.json";
import rod_fr from "../i18n/rite-of-discovery/fr.json";
import sys_en from "../i18n/systems-discovery/en.json";
import sys_fr from "../i18n/systems-discovery/fr.json";
import tme_en from "../i18n/toymaker-escape/en.json";
import tme_fr from "../i18n/toymaker-escape/fr.json";

type Dict = Record<string, any>;

function merge<T extends object>(...objs: T[]): T {
  return objs.reduce((acc, o) => {
    Object.keys(o || {}).forEach((k) => {
      const v: any = (o as any)[k];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        (acc as any)[k] = merge((acc as any)[k] || {}, v);
      } else {
        (acc as any)[k] = v;
      }
    });
    return acc;
  }, {} as any);
}

const dictionaries: Record<"en" | "fr", Dict> = {
  en: merge({}, tme_en, rod_en, sys_en),
  fr: merge({}, tme_fr, rod_fr, sys_fr),
};

let currentLocale: keyof typeof dictionaries = "en";

export function detectLang(): "en" | "fr" {
  if (typeof window === "undefined") {
    return currentLocale;
  }
  const stored = window.localStorage.getItem("lang");
  if (stored === "en" || stored === "fr") {
    return stored;
  }
  const nav = (navigator?.language || "en").toLowerCase();
  if (nav.startsWith("fr")) {
    return "fr";
  }
  return "en";
}

export function setLocale(locale: keyof typeof dictionaries) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lang", locale);
  }
}

export function getLocale(): keyof typeof dictionaries {
  return currentLocale;
}

export function initI18n(initial?: "en" | "fr") {
  currentLocale = initial ?? detectLang();
}

export function t(path: string): string {
  const dict = dictionaries[currentLocale] as any;
  const parts = path.split(".");
  let node: any = dict;
  for (const p of parts) {
    if (node && typeof node === "object" && p in node) {
      node = node[p];
    } else {
      return path; // fallback to key
    }
  }
  return typeof node === "string" ? node : path;
}

export const i18n = {
  t,
  setLocale,
  detectLang,
  getLocale,
  initI18n,
};
