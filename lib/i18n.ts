// Minimal i18n utility for client components
import en from "../i18n/en.json";

type Dict = typeof en;

const dictionaries: Record<string, Dict> = {
    en,
};

let currentLocale: keyof typeof dictionaries = "en";

export function setLocale(locale: keyof typeof dictionaries) {
    currentLocale = locale;
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
